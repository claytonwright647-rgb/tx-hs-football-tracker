import { firecrawlClient } from './firecrawl';

interface DiscoveredTeam {
    name: string;
    url: string;
    source: string;
}

/**
 * TeamDiscoveryService
 * 
 * Responsible for finding new Texas High School Football teams
 * by mapping aggregation sites like MaxPreps District pages.
 */
export class TeamDiscoveryService {

    /**
     * Discover district hubs from a state root URL.
     * @param stateRootUrl e.g., 'https://www.maxpreps.com/tx/football/standings/'
     */
    async discoverDistricts(stateRootUrl: string): Promise<string[]> {
        console.log(`🗺️ Mapping State Hub: ${stateRootUrl}`);
        const mapResult = await firecrawlClient.map(stateRootUrl);

        if (!mapResult.success || !mapResult.data) {
            console.error('Failed to map state root:', mapResult.error);
            return [];
        }

        // Filter for district standings pages (heuristic based on URL patterns)
        // MaxPreps structure often involves /football/standings/district...
        const districtUrls = mapResult.data.filter(url =>
            url.includes('/standings/') && url.split('/').length > 6
        );

        console.log(`✅ Found ${districtUrls.length} potential district pages.`);
        return districtUrls;
    }

    /**
     * Crawl a district page to find Team Home Pages.
     * @param districtUrl e.g., 'https://www.maxpreps.com/leagues/...'
     */
    async discoverTeamsInDistrict(districtUrl: string): Promise<DiscoveredTeam[]> {
        console.log(`🕵️ Crawling District: ${districtUrl}`);

        // We scrape the district page to look for team links
        const scrapeResult = await firecrawlClient.scrape(districtUrl, {
            formats: ['html'], // We might parse HTML for specific <a> tags
        });

        if (!scrapeResult.success || !scrapeResult.data) {
            console.error(`Failed to scrape district ${districtUrl}:`, scrapeResult.error);
            return [];
        }

        // In a real implementation with parsing:
        // 1. Parse HTML
        // 2. Find links to /high-schools/... or /n/
        // 3. Deduplicate

        // For now, we return a placeholder as "Crawling logic needed here"
        // attempting to use Firecrawl's extract might be better.

        const extraction = await firecrawlClient.extract<{ teams: { name: string, url: string }[] }>(districtUrl, {
            prompt: "Extract a list of all high school football teams in this district standings table. Return their school name and the URL to their team home page.",
            schema: {
                type: "object",
                properties: {
                    teams: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                url: { type: "string" }
                            },
                            required: ["name", "url"]
                        }
                    }
                }
            }
        });

        if (extraction.success && extraction.data) {
            return extraction.data.teams.map(t => ({
                name: t.name,
                url: t.url,
                source: districtUrl
            }));
        }

        return [];
    }
}

export const teamDiscovery = new TeamDiscoveryService();
