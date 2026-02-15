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
        Act as a Web3 Intelligence Analyst. Triage this raw data for ACTIONABLE WEB3 opportunities.
        
        Raw Data: {text}
        
        Strict Triage Rules:
        - Include ONLY if it is a specific, open mission for Web3/Crypto applications (Grants, Hackathons, Bounties, Airdrops, Testnets).
        - MUST have a clear call to action (Apply, Submit, Join, Register).
        - MUST be about a blockchain protocol, dApp, or crypto project.
        - EXCLUDE: Generic news, partnership announcements without a call for others to join, recruitment (jobs), marketing hype without specific rewards/deadlines, and success stories.
        - EXCLUDE: Generic grants for non-crypto entities (e.g. government grants for schools).
        - IF UNSURE: Set is_opportunity to false. We prefer high-fidelity over high-volume.
        
        Refinement:
        1. Professional Title: Action-oriented (e.g. "Apply for Optimism Retro Grants").
        2. Category: Grant, Hackathon, Bounty, Airdrop, or Testnet.
        
        Output JSON only:
        {
            "is_opportunity": boolean,
            "category": "Grant" | "Hackathon" | "Bounty" | "Airdrop" | "Testnet",
            "title": "Clear Actionable Title",
            "reward_pool": "string",
            "deadline": "YYYY-MM-DD" | null,
            "chain": "string",
            "required_skills": ["skill1", "skill2"],
            "win_probability": "Low" | "Medium" | "High",
            "difficulty": "Beginner" | "Intermediate" | "Expert",
            "ai_summary": "Short crisp mission briefing",
            "strategy_tip": "Single tactical tip for winning",
            "reasons": "Why triaged this way"
        }
        """

        try:
            response = requests.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": "llama3-70b-8192", # Using 70B for deeper research
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"}
                }
            )

            if response.status_code == 200:
                data = response.json()['choices'][0]['message']['content']
                refined = json.loads(data)
                
                if not refined.get("is_opportunity"):
                    return None
                
                raw_item.update({
                    "title": refined.get("title"),
                    "category": refined.get("category"),
                    "reward_pool": refined.get("reward_pool"),
                    "deadline": datetime.strptime(refined["deadline"], "%Y-%m-%d") if refined.get("deadline") else None,
                    "chain": refined.get("chain"),
                    "required_skills": refined.get("required_skills", []),
                    "win_probability": refined.get("win_probability", "Medium"),
                    "difficulty": refined.get("difficulty", "Intermediate"),
                    "ai_summary": refined.get("ai_summary"),
                    "ai_strategy": refined.get("strategy_tip"),
                    "description": text + "\n\n---\n**AI MISSION INTELLIGENCE**\n" + refined.get("ai_summary", ""),
                    "ai_score": (85 if refined.get("win_probability") == "High" else 65) + (len(refined.get("required_skills", [])) * 2)
                })
                return raw_item
            else:
                return raw_item # Pass through on API error to avoid missing data

        except Exception as e:
            print(f"[Curator] Error: {e}")
            return raw_item
