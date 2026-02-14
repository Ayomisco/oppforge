import os
import requests
import json
from typing import List, Dict

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def generate_analysis(user_profile: dict, opportunity: dict) -> Dict[str, str]:
    """
    Generate "Why you should apply" and "Strategy" using Groq (Llama 3).
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
                "model": "llama3-8b-8192",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "response_format": {"type": "json_object"}
            }
        )
        
        if response.status_code == 200:
            content = response.json()['choices'][0]['message']['content']
            return json.loads(content)
        else:
            print(f"Groq Error: {response.text}")
            return {"match_reason": "AI Service unavailable.", "strategy": "Focus on requirements."}
            
    except Exception as e:
        print(f"AI Exception: {e}")
        return {"match_reason": "Analysis failed.", "strategy": "Check requirements manually."}
