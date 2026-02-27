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
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("FATAL ERROR: 'SECRET_KEY' environment variable must be set for secure JWT signing in production.")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days persistence

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

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

def get_optional_user(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(database.get_db)):
    """
    Optional auth dependency. Returns User model if token valid, else None.
    Does NOT throw 401 for anonymous users.
    """
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return db.query(UserModel).filter(UserModel.email == email).first()
    except (JWTError, Exception):
        return None

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
        import requests as httpx_requests
        
        idinfo = None
        try:
            # Try parsing as an id_token first
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        except ValueError:
            # If it's not a valid id_token, it might be an access_token. Let's fetch user info.
            # This allows the frontend to use a custom Google button (Implicit flow).
            res = httpx_requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo", 
                headers={"Authorization": f"Bearer {token}"},
                timeout=10.0
            )
            if res.status_code == 200:
                idinfo = res.json()
            else:
                raise ValueError("Invalid Google access token")
                
        if not idinfo:
            raise ValueError("Could not extract user information from Google.")
        
        google_id = idinfo.get('sub')
        email = idinfo.get('email')
        name = idinfo.get('name')
        first_name = idinfo.get('given_name')
        last_name = idinfo.get('family_name')
        picture = idinfo.get('picture')

        # 2. Logic: Find or Create User
        user = db.query(UserModel).filter(UserModel.email == email).first()
        is_new_user = False
        
        if not user:
            is_new_user = True
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
            "user": schemas.UserResponse.model_validate(user),
            "is_new_user": is_new_user
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {str(e)}")

import re
from eth_account import Account
from eth_account.messages import encode_defunct

@router.post("/wallet", response_model=dict)
def wallet_login(login_data: schemas.auth.WalletLoginRequest, db: Session = Depends(database.get_db)):
    """
    Finds or creates a user by wallet address after validating EIP-191 signature. Returns JWT.
    """
    address = login_data.address.lower()
    if not address or not login_data.signature or not login_data.message:
        raise HTTPException(status_code=400, detail="Wallet address, signature, and message required")

    # 1. Verify Timestamp (prevent replay attacks, +/- 5 minutes)
    try:
        match = re.search(r"Timestamp:\s*(\d+)", login_data.message, re.IGNORECASE)
        if not match:
            raise ValueError("No timestamp found in message")
        
        msg_time_ms = int(match.group(1))
        now_ms = int(datetime.utcnow().timestamp() * 1000)
        age_ms = now_ms - msg_time_ms
        
        if age_ms < -300000 or age_ms > 300000: # 5 minutes threshold
            raise ValueError("Signature expired or invalid timestamp")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid message format: {str(e)}")

    # 2. Verify Address Context
    if address not in login_data.message.lower():
        raise HTTPException(status_code=400, detail="Address in message does not match provider")

    # 3. Cryptographic Signature Verification
    try:
        signable_message = encode_defunct(text=login_data.message)
        recovered_address = Account.recover_message(signable_message, signature=login_data.signature)
        
        if recovered_address.lower() != address:
            raise HTTPException(status_code=401, detail="Signature verification failed: unauthorized signer")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid cryptographic signature: {e}")

    # Logic: Find or Create User by Wallet
    user = db.query(UserModel).filter(UserModel.wallet_address == address).first()
    is_new_user = False
    
    if not user:
        is_new_user = True
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
        "user": schemas.UserResponse.model_validate(user),
        "is_new_user": is_new_user
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

