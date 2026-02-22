from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Float, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from ..database import Base
import uuid
import enum

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class SubscriptionPayment(Base):
    __tablename__ = "subscription_payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Payment Info
    tx_hash = Column(String, unique=True, index=True, nullable=False) # Blockchain Tx Hash
    network = Column(String, default="arbitrum") # e.g., arbitrum, base, mainnet
    amount = Column(Float, nullable=False)
    currency = Column(String, default="ETH")
    
    # Plan Info
    tier = Column(String, nullable=False) # hunter, founder
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    
    # Metadata
    billing_email = Column(String, nullable=True)
    description = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    payment_id = Column(UUID(as_uuid=True), ForeignKey("subscription_payments.id"), nullable=True)
    
    invoice_number = Column(String, unique=True, nullable=False) # e.g. INV-2024-001
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD") # USD equivalent or ETH
    
    # PDF generation / File storage
    pdf_url = Column(String, nullable=True)
    
    status = Column(String, default="paid") # paid, open, void
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
