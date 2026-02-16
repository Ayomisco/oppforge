import asyncio
from app.scrapers.heavy.devpost import DevpostScraper

async def test():
    print('Testing Devpost Scraper...')
    scraper = DevpostScraper()
    items = await scraper.run_async()
    for i in items:
        print(f'- {i['title']} ({i['reward_pool']})')

if __name__ == '__main__':
    asyncio.run(test())
