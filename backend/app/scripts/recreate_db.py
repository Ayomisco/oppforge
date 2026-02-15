from app.database import engine, Base
from app.models.opportunity import Opportunity
from app.models.user import User
from app.models.notification import Notification
from app.models.tracking import TrackedApplication
from app.models.chat import ChatMessage

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("Creating all tables...")
Base.metadata.create_all(bind=engine)

print("Database reset complete.")
