import { FirecrawlClient } from '../lib/firecrawl';

async function testFirecrawl() {
    const client = new FirecrawlClient();

    console.log('--- Testing Scrape (Arlington Martin Context) ---');
    const scrapeResult = await client.scrape('https://www.texasfootball.com/team/arlington-martin-warriors/');
    console.log('Scrape Success:', scrapeResult.success);
    if (scrapeResult.success) {
        console.log('Preview:', scrapeResult.data.markdown.substring(0, 100) + '...');
    }

    console.log('\n--- Testing Extract (Arlington Martin Schedule) ---');
    const extractResult = await client.extract('https://www.maxpreps.com/tx/arlington/martin-warriors/football/schedule/', {
        prompt: 'Extract the 2026 football schedule for Martin High School.',
        schema: {} // In real usage, Zod schema goes here
    });
    console.log('Extract Success:', extractResult.success);
    if (extractResult.success) {
        console.log('Data:', JSON.stringify(extractResult.data, null, 2));
    }
}

testFirecrawl().catch(console.error);
