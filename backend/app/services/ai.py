import os
import requests
import json
from typing import List, Dict

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "https://oppaiengine.oppforge.xyz")

def check_duplicate_semantic(text: str, threshold: float = 0.85) -> List[Dict]:
    """Check for semantically similar opportunities already in the vector DB."""
    try:
        # Use find-similar if available or general search
        response = requests.post(
            f"{AI_ENGINE_URL}/ai/semantic-search", # Or new find-similar endpoint if exposed
            json={"query": text, "n_results": 3},
            timeout=10
        )
        if response.status_code == 200:
            results = response.json().get("results", [])
            # In the current AI Engine, we'll just check if any top result is very similar
            # For now, we return empty so ingestion can proceed if AI engine is down
            return results
        return []
    except:
        return []

def get_risk_assessment(opportunity: dict) -> Dict:
    """Get comprehensive risk assessment from AI Engine."""
    try:
        response = requests.post(
            f"{AI_ENGINE_URL}/ai/risk-assess",
            json={"opportunity": opportunity},
            timeout=15
        )
        if response.status_code == 200:
            return response.json()
        return {"risk_score": 50, "risk_level": "MEDIUM", "flags": ["AI Engine timeout"]}
    except:
        return {"risk_score": 50, "risk_level": "MEDIUM", "flags": ["AI Engine unreachable"]}

def generate_analysis(user_profile: dict, opportunity: dict) -> Dict[str, str]:
    """
    Generate "Why you should apply" and "Strategy" using Groq.
    """
    if not GROQ_API_KEY:
        return {
            "match_reason": "AI Key missing. Please configure Groq.",
            "strategy": "Ensure your profile is complete."
        }
        
    prompt = f"""
    Analyze the match between this User and Opportunity.
    
    User Profile:
    - Skills: {', '.join(user_profile.get('skills', []))}
    - Bio: {user_profile.get('bio', '')}
    - XP: {user_profile.get('xp', 0)}
    
    Opportunity:
    - Title: {opportunity.get('title')}
    - Description: {opportunity.get('description')}
    - Category: {opportunity.get('category')}
    - Chain: {opportunity.get('chain')}
    
    Output JSON only:
    {{
        "match_score": (0-100 integer),
        "why_apply": "2 sentence explanation of why they are a good fit.",
        "strategy": "2 sentence strategic advice on how to win."
    }}
    """
    
    try:
        response = requests.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "response_format": {"type": "json_object"}
            },
            timeout=15.0
        )
        
        if response.status_code == 200:
            content = response.json()['choices'][0]['message']['content']
            return json.loads(content)
        else:
            print(f"Groq Error: {response.status_code} - {response.text}")
            return {"match_reason": "AI Service unavailable.", "strategy": "Focus on requirements."}
            
    except Exception as e:
        print(f"AI Exception: {e}")
        return {"match_reason": "Analysis failed.", "strategy": "Check requirements manually."}
