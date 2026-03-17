from pydantic import BaseModel
from typing import Optional

class GoogleLoginRequest(BaseModel):
    token: str

class WalletLoginRequest(BaseModel):
    address: str
    signature: Optional[str] = None
    message: Optional[str] = None

class XLoginRequest(BaseModel):
    code: str
    code_verifier: str
    redirect_uri: str
