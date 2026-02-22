from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class PaymentVerifyRequest(BaseModel):
    tx_hash: str
    tier: str # hunter, founder
    network: str = "arbitrum"
    amount: float

class InvoiceResponse(BaseModel):
    id: uuid.UUID
    invoice_number: str
    amount: float
    currency: str
    status: str
    created_at: datetime
    pdf_url: Optional[str] = None

    class Config:
        from_attributes = True

class PaymentHistoryResponse(BaseModel):
    id: uuid.UUID
    tx_hash: str
    amount: float
    currency: str
    tier: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
