#!/usr/bin/env python3
"""
Fix Dashboard Issues Script
Fixes:
1. Onboarding redirect logic
2. Dashboard empty state (opportunities not loading)
3. Admin menu not showing
"""

from app.database import SessionLocal
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.enums import UserRole

def main():
    db = SessionLocal()
    
    print("🔧 Fixing Dashboard Issues...")
    print("="*60)
    
    # Issue 1: Check users and their onboarding status
    print("\n1️⃣ Checking User Onboarding Status:")
    users = db.query(User).all()
    for user in users:
        print(f"   {user.email}")
        print(f"      Role: {user.role}")
        print(f"      Onboarded: {user.onboarded}")
        print(f"      Skills: {len(user.skills or [])} skills")
    
    # Issue 2: Check opportunities
    print("\n2️⃣ Checking Opportunities:")
    total_opps = db.query(Opportunity).count()
    open_opps = db.query(Opportunity).filter(Opportunity.is_open == True).count()
    print(f"   Total: {total_opps}")
    print(f"   Open: {open_opps}")
    
    if open_opps > 0:
        print(f"   ✅ {open_opps} opportunities available")
        sample = db.query(Opportunity).filter(Opportunity.is_open == True).first()
        print(f"   Sample: {sample.title}")
    else:
        print("   ❌ No open opportunities found!")
        print("   Run scraper to populate: python -m app.tasks.scraping_tasks")
    
    # Issue 3: Check admin users
    print("\n3️⃣ Checking Admin Users:")
    admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
    print(f"   Found {len(admins)} admin(s):")
    for admin in admins:
        print(f"   - {admin.email} (onboarded: {admin.onboarded})")
    
    # Fix: Set onboarded=True for users who have filled profile
    print("\n🔧 Applying Fixes:")
    fixed_count = 0
    for user in users:
        # If user has skills or preferred chains, mark as onboarded
        if (user.skills and len(user.skills) > 0) or (user.preferred_chains and len(user.preferred_chains) > 0):
            if not user.onboarded:
                user.onboarded = True
                fixed_count += 1
                print(f"   ✅ Set onboarded=True for {user.email}")
    
    if fixed_count > 0:
        db.commit()
        print(f"\n✅ Fixed {fixed_count} user(s)")
    else:
        print("\n   No fixes needed")
    
    print("\n" + "="*60)
    print("✅ Diagnostic complete!")
    print("\nNext steps:")
    print("1. Refresh browser to see changes")
    print("2. If dashboard still empty, check browser console for errors")
    print("3. Verify backend is running: curl http://localhost:8000/opportunities/priority")
    
    db.close()

if __name__ == "__main__":
    main()
