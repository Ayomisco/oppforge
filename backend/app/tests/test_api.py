from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "OppForge API is running 🚀"}

def test_opportunities_list():
    response = client.get("/opportunities")
    assert response.status_code == 200
    # Seed data should exist
    data = response.json()
    assert len(data) > 0

def test_tracker_empty():
    # Needs auth, so expecting 401
    response = client.get("/tracker")
    assert response.status_code == 401

def test_stats():
    response = client.get("/stats/dashboard")
    assert response.status_code == 200
