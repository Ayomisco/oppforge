from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, schemas
from ..models.audit import AuditLog
from ..models.enums import UserRole
from .auth import get_current_user

router = APIRouter(prefix="/admin/audit", tags=["admin"])

@router.get("/", response_model=List[schemas.AuditLogResponse])
def read_audit_logs(
    limit: int = 50,
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    """
    Admin Only: Fetch system audit logs.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized access to forensic logs.")
    
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()

@router.get("/{id}", response_model=schemas.AuditLogResponse)
def read_audit_detail(
    id: str,
    db: Session = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized.")
    
    log = db.query(AuditLog).filter(AuditLog.id == id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log
