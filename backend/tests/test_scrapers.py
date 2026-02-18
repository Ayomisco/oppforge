#!/usr/bin/env python3
"""
Test all scrapers to verify they work correctly
Run: python test_scrapers.py
"""

import sys
sys.path.append('..')

from app.scrapers.dorahacks import DoraHacksScraper
from app.scrapers.questbook import QuestbookScraper
from app.scrapers.hackquest import HackQuestScraper
from app.scrapers.superteam import SuperteamScraper
from app.scrapers.twitter import TwitterScraper
from app.scrapers.reddit import RedditScraper

def test_scraper(scraper_class, name):
    """Test a single scraper"""
    print(f"\n{'='*60}")
    print(f"Testing {name}...")
    print('='*60)
    
    try:
        scraper = scraper_class()
        results = scraper.run()
        
        print(f"✅ {name} Success!")
        print(f"   Found: {len(results)} opportunities")
        
        if results:
            print(f"\n   Sample (first 3):")
            for i, opp in enumerate(results[:3], 1):
                title = opp.get('title', 'N/A')[:60]
                url = opp.get('url', 'N/A')[:50]
                reward = opp.get('reward_pool', 'N/A')
                print(f"   {i}. {title}")
                print(f"      Reward: {reward}")
                print(f"      URL: {url}")
        
        return True, len(results)
        
    except Exception as e:
        print(f"❌ {name} Failed!")
        print(f"   Error: {e}")
        return False, 0

def main():
    """Test all scrapers"""
    print("🧪 OppForge Scraper Test Suite")
    print("="*60)
    
    scrapers = [
        (DoraHacksScraper, "DoraHacks"),
        (QuestbookScraper, "Questbook"),
        (HackQuestScraper, "HackQuest"),
        (SuperteamScraper, "Superteam"),
        (TwitterScraper, "Twitter"),
        (RedditScraper, "Reddit"),
    ]
    
    results = []
    total_opportunities = 0
    
    for scraper_class, name in scrapers:
        success, count = test_scraper(scraper_class, name)
        results.append((name, success, count))
        total_opportunities += count
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 Test Summary")
    print('='*60)
    
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    for name, success, count in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status:12} {name:15} ({count} opportunities)")
    
    print(f"\n{'='*60}")
    print(f"Total: {passed}/{total} scrapers passed")
    print(f"Total Opportunities Found: {total_opportunities}")
    print('='*60)
    
    if passed == total:
        print("\n🎉 All scrapers working perfectly!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} scraper(s) need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())
