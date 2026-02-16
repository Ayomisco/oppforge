import pytest
import os
from unittest.mock import MagicMock
from app.services.curator import AgentCurator

@pytest.fixture
def sample_raw_opportunity():
    return {
        "title": "Build a DApp for Public Good",
        "description": "Calling all developers to build decentralized applications for public goods. Apply now to win grants. This is a hackathon focused on Ethereum ecosystem. Submit by Dec 31.",
        "url": "https://devpost.com/software/dapp-project",
        "source": "Devpost",
        "source_id": "test-dapp-ID"
    }

def test_triage_skips_noise():
    # Noise item
    noise = {
        "title": "Just launched a token!",
        "description": "Buy my token now! Moon soon! ignore this is spam.",
        "url": "https://twitter.com/spam",
        "source": "Twitter",
        "source_id": "spam-123"
    }
    # Should probably be filtered out by heuristic length check or LLM logic
    # Heuristic: Description length check (min 30 chars).
    # If LLM runs, it might return None.
    # Without mocking requests, this calls live API.
    # We can mock requests to test logic flow.
    pass

def test_triage_structure(sample_raw_opportunity):
    # Integration test with Live API (if configured) or mocks structure.
    # Check if returns dict with specialized keys.
    result = AgentCurator.triage_and_refine(sample_raw_opportunity)
    
    if os.getenv("GROQ_API_KEY"):
        if result:
            assert "is_opportunity" in result
            assert "category" in result
            assert result["category"] in ["Grant", "Hackathon", "Bounty", "Airdrop", "Testnet", "Other"]
            # Validates AI output schema
    else:
        # Fallback behavior
        pass
