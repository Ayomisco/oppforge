import os
import requests
import json
from typing import List, Dict, Optional
from datetime import datetime

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
            # Fallback to current simple logic if key is missing
            return raw_item

        text = raw_item.get("description", "")
        if len(text) < 30: return None

        prompt = f"""
        Act as a Web3 Opportunity Scout. Triage this raw data.
        
        Raw Data: {text}
        
        Determine if this is a real opportunity (Grant, Hackathon, Bounty, Airdrop, Testnet) or just chatter.
        Strictly exclude: generic news, price talk, memes, or "I want a grant" posts.
        
        If it's a real opportunity, refine the data.
        - Extract deadline (if any, use YYYY-MM-DD).
        - Extract reward token/amount (if any).
        - Correct category.
        
        Output JSON only:
        {{
            "is_opportunity": boolean,
            "category": "Grant" | "Hackathon" | "Bounty" | "Airdrop" | "Testnet",
            "title": "Concise high-impact title",
            "reward_pool": "Amount or 'Unspecified'",
            "deadline": "YYYY-MM-DD or null",
            "chain": "Best guess (Solana, Ethereum, etc) or 'Multi-chain'",
            "reasons": "Short reason for triage decision"
        }}
        """

        try:
            response = requests.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama3-8b-8192",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"}
                }
            )

            if response.status_code == 200:
                data = response.json()['choices'][0]['message']['content']
                refined = json.loads(data)
                
                if not refined.get("is_opportunity"):
                    return None
                
                # Merge refined data back into raw_item
                raw_item.update({
                    "title": refined.get("title"),
                    "category": refined.get("category"),
                    "reward_pool": refined.get("reward_pool"),
                    "deadline": datetime.strptime(refined["deadline"], "%Y-%m-%d") if refined.get("deadline") else None,
                    "chain": refined.get("chain"),
                    "ai_score": raw_item.get("ai_score", 50) + 10 # Boost for AI verified ones
                })
                return raw_item
            else:
                return raw_item # Pass through on API error to avoid missing data

        except Exception as e:
            print(f"[Curator] Error: {e}")
            return raw_item
