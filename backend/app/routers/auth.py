from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import database, schemas
from ..models import User as UserModel
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key_change_me_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days persistence

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- JWT Helpers ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def check_subscription_clearance(current_user: UserModel = Depends(get_current_user)):
    """
    Dependency to ensure the user has active subscription clearance.
    Admins bypass this check.
    """
    if current_user.role == "admin" or current_user.role == "ADMIN":
        return current_user
        
    if current_user.subscription_status not in ["active", "trialing"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forge Clearance Level: LOCKED. Upgrade your plan to restore access."
        )
    return current_user

# --- Endpoints ---

from ..schemas.auth import GoogleLoginRequest

@router.post("/google", response_model=dict)
def google_login(login_data: GoogleLoginRequest, db: Session = Depends(database.get_db)):
    """
    Verifies Google Token, Creates/Updates User, Returns JWT + User Data.
    """
    token = login_data.token
    if not token:
        raise HTTPException(status_code=400, detail="Token required")
    
    try:
        # 1. Verify Google Token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo.get('name')
        first_name = idinfo.get('given_name')
        last_name = idinfo.get('family_name')
        picture = idinfo.get('picture')

        # 2. Logic: Find or Create User
        user = db.query(UserModel).filter(UserModel.email == email).first()
        
        if not user:
            # Generate a simple username from email if not provided
            base_username = email.split('@')[0]
            # Simple dedup for username (could be improved)
            user = UserModel(
                email=email,
                google_id=google_id,
                full_name=name,
                first_name=first_name,
                last_name=last_name,
                username=base_username,
                avatar_url=picture,
                is_pro=False,
                tier="scout"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            if not user.google_id:
                user.google_id = google_id
            user.avatar_url = picture
            if not user.first_name: user.first_name = first_name
            if not user.last_name: user.last_name = last_name
            if not user.username: user.username = email.split('@')[0]
                
            db.commit()
            db.refresh(user)
            
        # 3. Create Session JWT
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": user.email, 
                "role": user.role.value, 
                "onboarded": user.onboarded
            }, 
            expires_delta=access_token_expires
        )
        
        # 4. Return everything needed for frontend state
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": schemas.UserResponse.model_validate(user)
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {str(e)}")

@router.post("/wallet", response_model=dict)
def wallet_login(login_data: schemas.auth.WalletLoginRequest, db: Session = Depends(database.get_db)):
    """
    Finds or creates a user by wallet address. Returns JWT.
    """
    address = login_data.address.lower()
    if not address:
        raise HTTPException(status_code=400, detail="Wallet address required")
    
    # Logic: Find or Create User by Wallet
    user = db.query(UserModel).filter(UserModel.wallet_address == address).first()
    
    if not user:
        # Create a new Web3 user
        user = UserModel(
            email=f"{address[:10]}@web3.internal", # Placeholder email for unique constraint
            wallet_address=address,
            username=f"hunter_{address[2:8]}",
            full_name=f"Hunter {address[:6]}",
            tier="scout",
            is_pro=False,
            onboarded=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create Session JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email, 
            "role": user.role.value if user.role else "user", 
            "onboarded": user.onboarded
        }, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": schemas.UserResponse.model_validate(user)
    }

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: UserModel = Depends(get_current_user)):
    """
    Get current logged-in user profile.
    """
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(
    updates: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Update user profile — name, skills, chains, socials, notification settings.
    Used by the Settings page Save button.
    """
    update_data = updates.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)
    
    # Rebuild full_name if first/last name provided
    if "first_name" in update_data or "last_name" in update_data:
        first = current_user.first_name or ""
        last = current_user.last_name or ""
        current_user.full_name = f"{first} {last}".strip()
    
    db.commit()
    db.refresh(current_user)
    return current_user

