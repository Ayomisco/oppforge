from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, ForeignKey, Enum
import enum
from ..database import Base

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

# Extend User Model with Role
# We can't easily extend an existing class in SQLAlchemy like this without redefining or using mixins.
# But since I just created the file, I can overwrite it with the new field included.
