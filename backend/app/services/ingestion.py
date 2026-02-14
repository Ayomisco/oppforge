from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.opportunity import Opportunity
from ..scrapers.twitter import TwitterScraper
from ..scrapers.reddit import RedditScraper
from ..scrapers.gitcoin import GitcoinScraper

class IngestionPipeline:
    def __init__(self):
        self.scrapers = [
            TwitterScraper(),
            RedditScraper(),
            GitcoinScraper()
        ]
        self.db = SessionLocal()

    def run(self):
        print("[Ingestion] Starting pipeline...")
        total_new = 0
        
        for scraper in self.scrapers:
            try:
                opportunities = scraper.run()
                new_count = self._save_opportunities(opportunities)
                total_new += new_count
            except Exception as e:
                print(f"[Ingestion] Error running {scraper.source_name}: {e}")

        self.db.close()
        print(f"[Ingestion] Pipeline complete. {total_new} new opportunities saved.")

    def _save_opportunities(self, opportunities):
        count = 0
        for opp_data in opportunities:
            # Simple Deduplication: Check source_id + source
            exists = self.db.query(Opportunity).filter(
                Opportunity.source_id == opp_data["source_id"],
                Opportunity.source == opp_data["source"]
            ).first()
            
            if not exists:
                # Advanced Deduplication: Check title similarity (exact match for now)
                # In V2, use vector embeddings or fuzzy matching
                title_exists = self.db.query(Opportunity).filter(
                    Opportunity.title == opp_data["title"]
                ).first()
                if title_exists:
                    continue

                print(f"  + Saving: {opp_data['title'][:40]}...")
                opp = Opportunity(**opp_data)
                self.db.add(opp)
                count += 1
        
        self.db.commit()
        return count

def run_pipeline():
    pipeline = IngestionPipeline()
    pipeline.run()

if __name__ == "__main__":
    run_pipeline()
