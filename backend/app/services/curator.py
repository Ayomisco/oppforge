import os
import requests
import json
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

class AgentCurator:
    """
    Automated curator that triage and refines raw scrapes.
    """
    
    @staticmethod
    def triage_and_refine(raw_item: Dict) -> Optional[Dict]:
        """
        Input: Raw scrape dict from Twitter/Reddit.
        Output: Refined dict or None (if noise).
        """
        if not GROQ_API_KEY:
            print("[Curator] Warning: GROQ_API_KEY not found.")
            return raw_item

        text = raw_item.get("description", "")
        title = raw_item.get("title", "")
        full_text = f"{title}. {text}"
        
        if len(full_text) < 15: return None

        prompt = f"""
        Act as a Web3 Intelligence Analyst. Triage this raw data for ACTIONABLE WEB3 opportunities.
        Raw Data: {full_text}
        Output JSON:
        {{
            "is_opportunity": true,
            "category": "Grant",
            "title": "Action Title",
            "reward_pool": "string",
            "deadline": "YYYY-MM-DD",
            "chain": "string",
            "required_skills": ["skill1"],
            "win_probability": "High",
            "difficulty": "Intermediate",
            "ai_summary": "Brief",
            "strategy_tip": "Tip"
        }}
        """

        try:
            print(f"[Curator] Calling Groq for: {title[:30]}...")
            response = requests.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"}
                },
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()['choices'][0]['message']['content']
                refined = json.loads(data)
                
                if not refined.get("is_opportunity"):
                    print(f"  [Curator] Skipped: {title[:30]} (Not an opportunity)")
                    return None
                
                print(f"  [Curator] Success: {refined.get('title')}")
                
                deadline_dt = None
                if refined.get("deadline"):
                    try:
                        deadline_dt = datetime.strptime(refined["deadline"], "%Y-%m-%d")
                    except: pass

                raw_item.update({
                    "title": refined.get("title", title),
                    "category": refined.get("category", "Uncategorized"),
                    "reward_pool": refined.get("reward_pool"),
                    "deadline": deadline_dt,
                    "chain": refined.get("chain", "Multi-chain"),
                    "required_skills": refined.get("required_skills", []),
                    "win_probability": refined.get("win_probability", "Medium"),
                    "difficulty": refined.get("difficulty", "Intermediate"),
                    "ai_summary": refined.get("ai_summary"),
                    "ai_strategy": refined.get("strategy_tip"),
                    "ai_score": (90 if refined.get("win_probability") == "High" else 70) + (len(refined.get("required_skills", [])) * 2)
                })
                return raw_item
            else:
                print(f"  [Curator] API Error {response.status_code}: {response.text}")
                return None

        except Exception as e:
            print(f"  [Curator] Exception: {e}")
            return None
