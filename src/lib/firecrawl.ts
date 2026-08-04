import { Game, Team } from './types';

interface FirecrawlResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface FirecrawlScrapeOptions {
    formats?: ('markdown' | 'html' | 'rawHtml')[];
    onlyMainContent?: boolean;
}

interface FirecrawlExtractOptions {
    prompt?: string;
    schema?: any;
}

/**
 * FirecrawlClient
 * 
 * Production-ready wrapper for Firecrawl API.
 * strictly requires FIRECRAWL_API_KEY.
 */
export class FirecrawlClient {
    private apiKey: string | undefined;
    private baseUrl = 'https://api.firecrawl.dev/v1';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.FIRECRAWL_API_KEY;
    }

    /**
     * Scrape a single URL to get content
     */
    async scrape(url: string, options: FirecrawlScrapeOptions = { formats: ['markdown'] }): Promise<FirecrawlResponse<any>> {
        if (!this.apiKey) return { success: false, error: 'Missing API Key' };

        try {
            const response = await fetch(`${this.baseUrl}/scrape`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, ...options }),
            });

            if (!response.ok) throw new Error(`Firecrawl API Error: ${response.statusText}`);
            const data = await response.json();
            return { success: true, data: data.data };
        } catch (error: any) {
            console.error('Firecrawl Scrape Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Extract structured data from a URL using LLM
     */
    async extract<T>(url: string, options: FirecrawlExtractOptions): Promise<FirecrawlResponse<T>> {
        if (!this.apiKey) return { success: false, error: 'Missing API Key' };

        try {
            const body = {
                url,
                formats: ['extract'],
                extract: {
                    prompt: options.prompt,
                    schema: options.schema
                }
            };

            const response = await fetch(`${this.baseUrl}/scrape`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error(`Firecrawl API Error: ${response.statusText}`);
            const data = await response.json();
            return { success: true, data: data.data.extract };
        } catch (error: any) {
            console.error('Firecrawl Extract Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Map a website to find all subpages (Crawler)
     * Essential for discovering ALL team pages from a state hub.
     */
    async map(url: string, search?: string): Promise<FirecrawlResponse<string[]>> {
        if (!this.apiKey) return { success: false, error: 'Missing API Key' };

        try {
            const body: any = { url };
            if (search) body.search = search;

            const response = await fetch(`${this.baseUrl}/map`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error(`Firecrawl Map Error: ${response.statusText}`);
            const data = await response.json();
            return { success: true, data: data.data }; // Returns array of URLs
        } catch (error: any) {
            console.error('Firecrawl Map Error:', error);
            return { success: false, error: error.message };
        }
    }
}

export const firecrawlClient = new FirecrawlClient();

// Legacy export compatibility
// Legacy export compatibility
export const firecrawlSearch = async (query: string, limit: number = 1) => {
    // GameCard expects: { success: true, data: [{ markdown: "..." }] }
    // We will return a safe empty response for now to prevent build errors,
    // as we aren't using live scraping for GameCards in this deployment.
    return { success: true, data: [] as any[] };
};
