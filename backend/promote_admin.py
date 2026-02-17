import sys
from app.database import SessionLocal
from app.models.user import User
from app.models.enums import UserRole

def promote_to_admin(email):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User with email {email} not found.")
        return
    
    user.role = UserRole.ADMIN
    db.commit()
    print(f"Successfully promoted {email} to ADMIN.")
    db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_admin.py <email>")
    else:
        promote_to_admin(sys.argv[1])
