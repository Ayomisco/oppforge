from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        print("Migrating schema...")
        conn.execute(text("ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS urgency_score INTEGER DEFAULT 0;"))
        conn.execute(text("ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS difficulty_score INTEGER DEFAULT 5;"))
        # Note: ai_strategy might already exist from Phase 6, but good to be safe
        conn.execute(text("ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS ai_strategy TEXT;"))
        conn.commit()
        print("Schema migration complete.")

if __name__ == "__main__":
    migrate()
