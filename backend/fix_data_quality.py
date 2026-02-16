import asyncio
from app.database import SessionLocal
from app.models.opportunity import Opportunity
from app.services.curator import AgentCurator
from app.utils.text_processing import extract_deadline, extract_reward_pool, extract_skills

async def fix_scanty_data():
    print("[DataFix] Starting deep refinement of existing sparse opportunities...")
    db = SessionLocal()
    try:
        opportunities = db.query(Opportunity).all()
        print(f"[DataFix] Scanning {len(opportunities)} items...")
        
        updated_count = 0
        for opp in opportunities:
            # Check if it looks scanty (missing skills, summary, or using default strategy)
            is_scanty = (
                not opp.required_skills or 
                len(opp.required_skills) == 0 or 
                not opp.ai_summary or
                "Focus on community engagement" in (opp.ai_strategy or "")
            )
            
            if is_scanty:
                print(f"  ? Refining scanty item: {opp.title[:30]}...")
                
                # Prepare data for triage
                raw_data = {
                    "title": opp.title,
                    "description": opp.description,
                    "category": opp.category,
                    "source": opp.source,
                    "source_id": opp.source_id,
                    "url": opp.url
                }
                
                refined = AgentCurator.triage_and_refine(raw_data)
                
                if refined:
                    # Update the object
                    opp.title = refined.get("title", opp.title)
                    opp.category = refined.get("category", opp.category)
                    opp.ai_summary = refined.get("ai_summary", opp.ai_summary)
                    opp.ai_strategy = refined.get("ai_strategy", opp.ai_strategy)
                    opp.required_skills = refined.get("required_skills", [])
                    opp.reward_pool = refined.get("reward_pool", opp.reward_pool)
                    opp.ai_score = refined.get("ai_score", opp.ai_score)
                    opp.win_probability = refined.get("win_probability", opp.win_probability)
                    opp.difficulty = refined.get("difficulty", opp.difficulty)
                    
                    # Update tags with skills
                    existing_tags = opp.tags or []
                    opp.tags = list(set(existing_tags + (opp.required_skills or [])))
                    
                    # Re-extract deadline if null
                    if not opp.deadline:
                        text_blob = f"{opp.title} {opp.description}"
                        found_deadline = extract_deadline(text_blob)
                        if found_deadline:
                             from datetime import datetime
                             try:
                                 opp.deadline = datetime.fromisoformat(found_deadline)
                             except: pass

                    updated_count += 1
                    if updated_count % 5 == 0:
                        db.commit()
                        print(f"  [DataFix] Committed {updated_count} updates...")
                else:
                    print(f"  - Item discarded by AI during refinement: {opp.title[:30]}")
        
        db.commit()
        print(f"[DataFix] Finished. {updated_count} items enriched.")
        
    except Exception as e:
        print(f"[DataFix] Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(fix_scanty_data())
