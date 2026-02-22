import argparse
import sys
import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.models.enums import UserRole
from app.models.opportunity import Opportunity
from app.models.billing import SubscriptionPayment

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def promote_user(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"❌ User with email {email} not found.")
        return
    user.role = UserRole.ADMIN
    db.commit()
    print(f"✅ User {email} promoted to ADMIN.")
    db.close()

def list_users():
    db = SessionLocal()
    users = db.query(User).all()
    print(f"\n--- Registered Users ({len(users)}) ---")
    for u in users:
        print(f"ID: {u.id} | Email: {u.email} | Role: {u.role} | Tier: {u.tier}")
    db.close()

def delete_user(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"❌ User with email {email} not found.")
        return
    db.delete(user)
    db.commit()
    print(f"✅ User {email} deleted.")
    db.close()

def add_user(email: str, username: str, role: str = "user"):
    db = SessionLocal()
    existing = db.query(User).filter((User.email == email) | (User.username == username)).first()
    if existing:
        print(f"❌ User with email {email} or username {username} already exists.")
        return
    
    # Simple role mapping
    target_role = UserRole.USER
    if role.lower() == "admin": target_role = UserRole.ADMIN
    elif role.lower() == "moderator": target_role = UserRole.MODERATOR

    new_user = User(
        email=email,
        username=username,
        role=target_role,
        onboarded=True,
        tier="scout"
    )
    db.add(new_user)
    db.commit()
    print(f"✅ User {username} ({email}) created with role {target_role}.")
    db.close()

def search_user(query: str):
    db = SessionLocal()
    # Search by email or username
    users = db.query(User).filter(
        (User.email.contains(query)) | (User.username.contains(query))
    ).all()
    
    if not users:
        print(f"🔍 No users found matching: {query}")
    else:
        print(f"\n--- Search Results ({len(users)}) ---")
        for u in users:
            print(f"ID: {u.id} | Email: {u.email} | Username: {u.username} | Role: {u.role}")
    db.close()

def list_opportunities():
    db = SessionLocal()
    opps = db.query(Opportunity).order_by(Opportunity.created_at.desc()).limit(20).all()
    print(f"\n--- Latest Opportunities ({len(opps)}) ---")
    for o in opps:
        status = "✅ Verified" if o.is_verified else "⏳ Pending"
        print(f"ID: {o.id} | Title: {o.title[:30]}... | Status: {status} | Source: {o.source}")
    db.close()

def create_opportunity(title: str, url: str, category: str, chain: str):
    db = SessionLocal()
    opp = Opportunity(
        title=title,
        url=url,
        category=category,
        chain=chain,
        source="manual",
        is_verified=True
    )
    db.add(opp)
    db.commit()
    print(f"✅ Opportunity created: {opp.id}")
    db.close()

def delete_opportunity(opp_id: str):
    db = SessionLocal()
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        print(f"❌ Opportunity {opp_id} not found.")
        return
    db.delete(opp)
    db.commit()
    print(f"✅ Opportunity {opp_id} deleted.")
    db.close()

def clear_opportunities():
    db = SessionLocal()
    try:
        count = db.query(Opportunity).delete()
        db.commit()
        print(f"🔥 Purged {count} opportunities from the forge.")
    except Exception as e:
        db.rollback()
        print(f"❌ Failed to clear opportunities: {str(e)}")
    finally:
        db.close()

def verify_opportunity(opp_id: str):
    db = SessionLocal()
    opp = db.query(Opportunity).filter(Opportunity.id == opp_id).first()
    if not opp:
        print(f"❌ Opportunity {opp_id} not found.")
        return
    opp.is_verified = True
    db.commit()
    print(f"✅ Opportunity {opp_id} verified.")
    db.close()

def main():
    parser = argparse.ArgumentParser(description="OppForge Backend Admin Tool")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # User Management
    parser_promote = subparsers.add_parser("promote", help="Promote a user to ADMIN")
    parser_promote.add_argument("email", help="Email of the user")

    parser_list_users = subparsers.add_parser("users", help="List all users")
    
    parser_delete_user = subparsers.add_parser("delete-user", help="Delete a user")
    parser_delete_user.add_argument("email", help="Email of the user")

    parser_add_user = subparsers.add_parser("add-user", help="Add a new user manually")
    parser_add_user.add_argument("email", help="Email of the user")
    parser_add_user.add_argument("username", help="Username for the user")
    parser_add_user.add_argument("--role", default="user", help="Role (user, admin, moderator)")

    parser_search_user = subparsers.add_parser("search-user", help="Search for a user by email or username")
    parser_search_user.add_argument("query", help="Email or username fragment to search for")

    # Opportunity Management
    parser_list_opps = subparsers.add_parser("opps", help="List opportunities")
    
    parser_create_opp = subparsers.add_parser("create-opp", help="Create an opportunity")
    parser_create_opp.add_argument("title", help="Title of the opportunity")
    parser_create_opp.add_argument("url", help="URL of the opportunity")
    parser_create_opp.add_argument("--category", default="Grant", help="Category (Grant, Bounty, etc.)")
    parser_create_opp.add_argument("--chain", default="Multi-chain", help="Chain (Solana, Ethereum, etc.)")

    parser_delete_opp = subparsers.add_parser("delete-opp", help="Delete an opportunity")
    parser_delete_opp.add_argument("id", help="UUID of the opportunity")

    parser_clear_opps = subparsers.add_parser("clear-opps", help="Delete ALL opportunities from the database")

    parser_verify_opp = subparsers.add_parser("verify", help="Verify an opportunity")
    parser_verify_opp.add_argument("id", help="UUID of the opportunity")

    args = parser.parse_args()

    if args.command == "promote":
        promote_user(args.email)
    elif args.command == "users":
        list_users()
    elif args.command == "delete-user":
        delete_user(args.email)
    elif args.command == "add-user":
        add_user(args.email, args.username, args.role)
    elif args.command == "search-user":
        search_user(args.query)
    elif args.command == "opps":
        list_opportunities()
    elif args.command == "create-opp":
        create_opportunity(args.title, args.url, args.category, args.chain)
    elif args.command == "delete-opp":
        delete_opportunity(args.id)
    elif args.command == "clear-opps":
        clear_opportunities()
    elif args.command == "verify":
        verify_opportunity(args.id)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
