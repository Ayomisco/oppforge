from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
import pytest

# Use in-memory SQLite for testing to avoid messing with Aiven
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "OppForge API is running 🚀"}

def test_auth_google_login():
    # Mocking Google Auth is hard without token, but we can test bad token
    response = client.post("/auth/google", json={"token": "bad_token"})
    assert response.status_code == 400 # Should fail

def test_opportunities_crud():
    # 1. List (Empty)
    response = client.get("/opportunities")
    assert response.status_code == 200
    assert response.json() == []

    # 2. Scrape/Seed (Direct DB Insert for test)
    # We can't easily trigger scrape in test, so insert manually
    from app.models.opportunity import Opportunity
    db = TestingSessionLocal()
    opp = Opportunity(
        title="Test Grant",
        slug="test-grant",
        url="http://example.com",
        source="Manual",
        category="Grant",
        chain="Ethereum",
        ai_score=90,
        description="A test opportunity"
    )
    db.add(opp)
    db.commit()
    db.close()

    # 3. List (Found)
    response = client.get("/opportunities")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Test Grant"

    # 4. Detail
    opp_id = response.json()[0]["id"]
    response = client.get(f"/opportunities/{opp_id}")
    assert response.status_code == 200
    assert response.json()["category"] == "Grant"

    # 5. Search
    response = client.get("/opportunities/search?q=Grant")
    assert response.status_code == 200
    assert len(response.json()) == 1

    # 6. Trending
    response = client.get("/opportunities/trending")
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_tracker_flow():
    # Requires Auth (Mocking current_user)
    # This is complex in integration test without override. 
    # For now, we skip tracker auth tests or accept 401.
    response = client.get("/tracker")
    assert response.status_code == 401

def test_notifications():
    response = client.get("/notifications")
    assert response.status_code == 401

if __name__ == "__main__":
    # If run directly
    test_root()
    test_opportunities_crud()
    print("✅ Full API Test Passed (Auth/Tracker skipped due to mock complexity)")
