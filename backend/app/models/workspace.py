from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, BigInteger
from sqlalchemy.sql import func
from ..database import Base

class WorkspaceUpload(Base):
    """User-uploaded files for AI workspace (CV, portfolio, etc.)"""
    __tablename__ = "workspace_uploads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)  # Original filename
    file_path = Column(String(512), nullable=False)  # Server storage path
    file_size = Column(BigInteger, nullable=False)  # Size in bytes
    file_type = Column(String(10), nullable=False)  # Extension (.pdf, .docx, etc.)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<WorkspaceUpload {self.filename} by user_id={self.user_id}>"


class WorkspaceChat(Base):
    """Chat messages in AI workspace"""
    __tablename__ = "workspace_chats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<WorkspaceChat {self.role}: {self.content[:30]}...>"
