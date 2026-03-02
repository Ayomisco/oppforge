from sqlalchemy import Column, String, Integer, Boolean, DateTime, JSON, ForeignKey, Enum
import enum
from ..database import Base

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUB_ADMIN = "sub_admin"
    MODERATOR = "moderator"

# Helper sets for permission checks
ADMIN_ROLES = {UserRole.ADMIN}
STAFF_ROLES = {UserRole.ADMIN, UserRole.SUB_ADMIN}  # Can view analytics, audit
MANAGEMENT_ROLES = {UserRole.ADMIN}  # Can edit users, manage data
