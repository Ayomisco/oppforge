"""
Add billing fields to users table.
Works with both SQLite (local) and PostgreSQL (production).
Run: cd backend && PYTHONPATH=. venv/bin/python app/scripts/add_billing_fields.py
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import engine
from sqlalchemy import text, inspect

def migrate():
    inspector = inspect(engine)
    existing_columns = [col['name'] for col in inspector.get_columns('users')]
    
    with engine.connect() as conn:
        # Add trial_started_at
        if 'trial_started_at' not in existing_columns:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN trial_started_at TIMESTAMP"))
                conn.execute(text("UPDATE users SET trial_started_at = created_at"))
                print("✅ Added trial_started_at (backfilled from created_at)")
            except Exception as e:
                print(f"⏭  trial_started_at: {e}")
                conn.rollback()
        else:
            print("⏭  trial_started_at already exists")

        # Add subscription_expires_at
        if 'subscription_expires_at' not in existing_columns:
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP"))
                print("✅ Added subscription_expires_at")
            except Exception as e:
                print(f"⏭  subscription_expires_at: {e}")
                conn.rollback()
        else:
            print("⏭  subscription_expires_at already exists")

        conn.commit()
        print("\n🎯 Billing fields migration complete!")

if __name__ == "__main__":
    migrate()
