#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from dotenv import load_dotenv
load_dotenv()
from app.database import SessionLocal
from app.models.opportunity import Opportunity
from sqlalchemy import func

db = SessionLocal()
dupes = db.query(Opportunity.title, func.count(Opportunity.id)).group_by(Opportunity.title).having(func.count(Opportunity.id) > 1).all()
print(f"Found {len(dupes)} duplicate titles:")
for title, count in dupes:
    print(f"  [{count}x] {title}")
    rows = db.query(Opportunity.id, Opportunity.ai_score).filter(Opportunity.title == title).all()
    for r in rows:
        print(f"    id={r.id} score={r.ai_score}")
db.close()
