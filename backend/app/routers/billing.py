from web3 import Web3
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime, timedelta
import os

from .. import database, schemas, models
from .auth import get_current_user
from ..services.email_service import send_email, get_email_template

router = APIRouter(prefix="/billing", tags=["billing"])


# Active payment network config
DEFAULT_NETWORK = os.getenv("PAYMENT_NETWORK", "sepolia")
MASTER_WALLET = os.getenv("OPPFORGE_MASTER_WALLET", "")
PROTOCOL_CONTRACT = os.getenv(
    "PROTOCOL_CONTRACT_ADDRESS", "0x502973c5413167834d49078f214ee777a8C0A8Cf")
CELO_PROTOCOL_CONTRACT = os.getenv("CELO_PROTOCOL_CONTRACT_ADDRESS", "")

# Valid payment recipients (master wallet + all known contracts across chains)
VALID_RECIPIENTS = {addr.lower()
                    for addr in [MASTER_WALLET, PROTOCOL_CONTRACT, CELO_PROTOCOL_CONTRACT] if addr}

# RPC URLs per network
RPC_URLS = {
    "arbitrum": os.getenv("ARBITRUM_RPC_URL", "https://arb1.arbitrum.io/rpc"),
    "sepolia": os.getenv("SEPOLIA_RPC_URL", "https://ethereum-sepolia-rpc.publicnode.com"),
    "ethereum": os.getenv("ETHEREUM_RPC_URL", "https://eth.llamarpc.com"),
    "celo": os.getenv("CELO_RPC_URL", "https://forno.celo.org"),
    "alfajores": os.getenv("ALFAJORES_RPC_URL", "https://alfajores-forno.celo-testnet.org"),
}


@router.post("/verify-payment", response_model=schemas.billing.PaymentHistoryResponse)
async def verify_payment(
    request: schemas.billing.PaymentVerifyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Verify an on-chain payment and upgrade the user's tier.
    """
    if request.tier != "hunter":
        raise HTTPException(
            status_code=400, detail="Only hunter tier is supported")

    # 1. Check if tx_hash already exists (prevent double-spending the same tx)
    existing = db.query(models.billing.SubscriptionPayment).filter(
        models.billing.SubscriptionPayment.tx_hash == request.tx_hash
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Transaction already processed")

    # 2. Cryptographic On-Chain Verification
    try:
        rpc_url = RPC_URLS.get(request.network, RPC_URLS[DEFAULT_NETWORK])
        w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={'timeout': 15}))

        # Ensure hash is formatted correctly
        if not request.tx_hash.startswith('0x'):
            raise ValueError("tx_hash must start with 0x")

        tx = w3.eth.get_transaction(request.tx_hash)
        receipt = w3.eth.get_transaction_receipt(request.tx_hash)

        if receipt.status != 1:
            raise HTTPException(
                status_code=400, detail="Transaction failed on-chain")

        # Verify recipient is either master wallet or a known contract
        if tx.to.lower() not in VALID_RECIPIENTS:
            raise HTTPException(
                status_code=400, detail="Transaction recipient is not an OppForge address")

    except HTTPException:
        raise

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
    currency = "CELO" if request.network in ("celo", "alfajores") else "ETH"
    invoice_num = f"INV-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}"
    invoice = models.billing.Invoice(
        user_id=current_user.id,
        payment_id=payment.id,
        invoice_number=invoice_num,
        amount=request.amount,
        currency=currency,
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
    <p><b>Amount:</b> {request.amount} {currency}</p>
    <p><b>Invoice:</b> {invoice_num}</p>
    <p>Welcome to the Elite Hunter Program.</p>
    """
    template = get_email_template(
        title="Forge Clearance Level: UPGRADED",
        body=email_body,
        cta_link="https://oppforge.xyz/dashboard",
        cta_text="Access Command Center"
    )
    background_tasks.add_task(
        send_email, current_user.email, f"Receipt: {invoice_num}", template)

    return payment


@router.get("/invoices", response_model=List[schemas.billing.InvoiceResponse])
def get_invoices(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.billing.Invoice).filter(models.billing.Invoice.user_id == current_user.id).all()


@router.get("/history", response_model=List[schemas.billing.PaymentHistoryResponse])
def get_payment_history(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.billing.SubscriptionPayment).filter(models.billing.SubscriptionPayment.user_id == current_user.id).all()
