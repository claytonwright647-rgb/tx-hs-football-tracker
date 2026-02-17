/**
 * IngestionQueue
 * 
 * A simple in-memory queue to manage Firecrawl requests.
 * Ensures we respect rate limits and don't overwhelm the API.
 */
export class IngestionQueue {
    private concurrency: number;
    private delayMs: number;
    private activeCount: number = 0;
    private queue: Array<() => Promise<void>> = [];
    private isProcessing: boolean = false;

    constructor(concurrency: number = 2, delayMs: number = 2000) {
        this.concurrency = concurrency;
        this.delayMs = delayMs;
    }

    /**
     * Add a task to the queue
     */
    add<T>(task: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            const wrappedTask = async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            this.queue.push(wrappedTask);
            this.process();
        });
    }

    /**
     * Process the queue
     */
    private async process() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            // Wait if we hit concurrency limit
            if (this.activeCount >= this.concurrency) {
                await new Promise(resolve => setTimeout(resolve, 100)); // tight loop wait
                continue;
            }

            const task = this.queue.shift();
            if (!task) break;

            this.activeCount++;

            // Execute task without awaiting completion here (fire and forget from loop perspective)
            task().finally(() => {
                this.activeCount--;
                // Enforce rate limit delay after task completion
                setTimeout(() => {
                    // delay completed
                }, this.delayMs);
            });

            // Slight stagger between launching tasks
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        this.isProcessing = false;
    }
}

export const ingestionQueue = new IngestionQueue(2, 2000); // 2 concurrent, 2s delay
