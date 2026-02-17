"""
Add risk assessment fields to opportunities table
Run this ONCE to add risk_score, risk_level, risk_flags
"""

from sqlalchemy import create_engine, Column, Integer, String, JSON, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
# SQLAlchemy 2.0 requires postgresql:// instead of postgres://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
engine = create_engine(DATABASE_URL)

print("🔄 Adding risk assessment fields to opportunities table...")

with engine.connect() as conn:
    try:
        # Add risk_score column
        conn.execute(text("""
            ALTER TABLE opportunities 
            ADD COLUMN IF NOT EXISTS risk_score INTEGER;
        """))
        print("✅ Added risk_score column")
        
        # Add risk_level column  
        conn.execute(text("""
            ALTER TABLE opportunities 
            ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20);
        """))
        print("✅ Added risk_level column")
        
        # Add risk_flags column
        conn.execute(text("""
            ALTER TABLE opportunities 
            ADD COLUMN IF NOT EXISTS risk_flags JSON DEFAULT '[]';
        """))
        print("✅ Added risk_flags column")
        
        # Create index on risk_score
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_opportunities_risk_score 
            ON opportunities(risk_score);
        """))
        print("✅ Created index on risk_score")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
