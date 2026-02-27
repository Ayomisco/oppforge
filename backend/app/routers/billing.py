from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime, timedelta

from .. import database, schemas, models
from .auth import get_current_user
from ..services.email_service import send_email, get_email_template

router = APIRouter(prefix="/billing", tags=["billing"])

from web3 import Web3

# OppForge Master Wallet on Arbitrum
MASTER_WALLET = "0x15f79927627448e89E90f6FCE0e5f22E42Ead1a6"
RPC_URL = "https://arb1.arbitrum.io/rpc"

@router.post("/verify-payment", response_model=schemas.billing.PaymentHistoryResponse)
async def verify_payment(
    request: schemas.billing.PaymentVerifyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Verify an on-chain payment on Arbitrum and upgrade the user's tier.
    """
    # 1. Check if tx_hash already exists (prevent double-spending the same tx)
    existing = db.query(models.billing.SubscriptionPayment).filter(
        models.billing.SubscriptionPayment.tx_hash == request.tx_hash
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Transaction already processed")

    # 2. Cryptographic On-Chain Verification
    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URL, request_kwargs={'timeout': 10}))
        
        # Ensure hash is formatted correctly
        if not request.tx_hash.startswith('0x'):
            raise ValueError("tx_hash must start with 0x")
            
        tx = w3.eth.get_transaction(request.tx_hash)
        receipt = w3.eth.get_transaction_receipt(request.tx_hash)
        
        if receipt.status != 1:
            raise HTTPException(status_code=400, detail="Transaction failed on-chain")
            
        if tx.to.lower() != MASTER_WALLET.lower():
            raise HTTPException(status_code=400, detail="Transaction recipient is not the OppForge master wallet")
            
        # Verify amount sent (permit slight dust discrepancies but must be >= requested)
        expected_wei = w3.to_wei(request.amount, 'ether')
        if tx.value < expected_wei:
            raise HTTPException(status_code=400, detail=f"Insufficient funds sent. Expected {expected_wei}, got {tx.value}")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Verification failed: {str(e)}")

    # 3. Create Payment Record
    payment = models.billing.SubscriptionPayment(
        user_id=current_user.id,
        tx_hash=request.tx_hash,
        network=request.network,
        amount=request.amount,
        tier=request.tier,
        status=models.billing.PaymentStatus.COMPLETED
    )
    db.add(payment)
    
    # 4. Create Invoice
    invoice_num = f"INV-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"
    invoice = models.billing.Invoice(
        user_id=current_user.id,
        payment_id=payment.id,
        invoice_number=invoice_num,
        amount=request.amount,
        currency="ETH",
        status="paid"
    )
    db.add(invoice)

    # 5. Upgrade User
    current_user.tier = request.tier
    current_user.is_pro = True
    current_user.subscription_status = "active"
    current_user.subscription_expires_at = datetime.now() + timedelta(days=30)
    
    db.commit()
    db.refresh(payment)

    # 6. Send Receipt Email (Background Task)
    email_body = f"""
    <h3>Payment Received!</h3>
    <p>Your upgrade to <b>{request.tier.upper()}</b> is confirmed.</p>
    <p><b>Transaction:</b> {request.tx_hash[:10]}...{request.tx_hash[-8:]}</p>
    <p><b>Amount:</b> {request.amount} ETH</p>
    <p><b>Invoice:</b> {invoice_num}</p>
    <p>Welcome to the Elite Hunter Program.</p>
    """
    template = get_email_template(
        title="Forge Clearance Level: UPGRADED",
        body=email_body,
        cta_link="https://oppforge.xyz/dashboard",
        cta_text="Access Command Center"
    )
    background_tasks.add_task(send_email, current_user.email, f"Receipt: {invoice_num}", template)

    return payment

@router.get("/invoices", response_model=List[schemas.billing.InvoiceResponse])
def get_invoices(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.billing.Invoice).filter(models.billing.Invoice.user_id == current_user.id).all()

@router.get("/history", response_model=List[schemas.billing.PaymentHistoryResponse])
def get_payment_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.billing.SubscriptionPayment).filter(models.billing.SubscriptionPayment.user_id == current_user.id).all()
