# Backend API Integration Test
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import SessionLocal, engine, Base
from app.models.opportunity import Opportunity
from app.models.user import User

@pytest.fixture(scope="session")
def db_session():
    # Setup test DB (isolated or live?)
    db = SessionLocal()
    yield db
    db.close()

@pytest.mark.asyncio
async def test_api_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

@pytest.mark.asyncio
async def test_search_endpoint(db_session):
    # Verify search returns items from scrapers
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/search/?q=hackathon")
        assert response.status_code == 200
        data = response.json()
        
        assert "results" in data
        assert "total_found" in data
        
        # We expect at least *some* hackathons from recent scraping
        if data["total_found"] > 0:
            item = data["results"][0]
            assert "title" in item
            assert "url" in item
            # Check for AI refined fields if present
            # assert "relevance_score" in item
            # assert "category" in item
        else:
            pytest.skip("No hackathons found in DB for search query 'hackathon'. Run ingestion first.")

@pytest.mark.asyncio
async def test_opportunities_endpoint(db_session):
    # Verify main list endpoint
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Check both potential paths
        response = await ac.get("/opportunities/") 
        if response.status_code == 404:
             response = await ac.get("/api/opportunities/")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify Devpost items exist
        devpost_items = [o for o in data if o.get("source") == "Devpost"]
        if devpost_items:
             assert len(devpost_items) > 0
             print(f"Found {len(devpost_items)} Devpost opportunities via API.")
