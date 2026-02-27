from pydantic import BaseModel

class GoogleLoginRequest(BaseModel):
    token: str

class WalletLoginRequest(BaseModel):
    address: str
    signature: str
    message: str
