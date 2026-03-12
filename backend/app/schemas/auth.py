from pydantic import BaseModel

class GoogleLoginRequest(BaseModel):
    token: str

class WalletLoginRequest(BaseModel):
    address: str
    signature: str
    message: str

class XLoginRequest(BaseModel):
    code: str
    code_verifier: str
    redirect_uri: str
