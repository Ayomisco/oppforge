import os
import requests
import json
import re
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
AI_ENGINE_URL = os.getenv("AI_ENGINE_URL", "http://localhost:8001")

def parse_reward_to_usd(reward_str: str) -> float:
    """
    Parse reward_pool string to USD float.
    Examples:
      "$50,000" -> 50000.0
      "$1M" -> 1000000.0
      "5000 USDC" -> 5000.0
      "Alpha" -> 0.0
      "TBD" -> 0.0
    """
    if not reward_str or not isinstance(reward_str, str):
        return 0.0
    
    # Remove common noise
    reward_str = reward_str.upper().strip()
    
    # Non-monetary keywords
    if any(x in reward_str for x in ["ALPHA", "TBD", "VARIES", "SEE DETAILS", "TOKEN ALLOCATION", "FUTURE"]):
        return 0.0
    
    # Extract number pattern
    # Match patterns like: $1,000,000 or 50K or 1.5M
    match = re.search(r'[\$]?\s*([0-9]+[,\.]?[0-9]*)\s*([KMB])?', reward_str)
    if not match:
        return 0.0
    
    num_str = match.group(1).replace(',', '')
    multiplier_str = match.group(2) or ''
    
    try:
        base_value = float(num_str)
    except ValueError:
        return 0.0
    
    # Apply multiplier
    multipliers = {'K': 1_000, 'M': 1_000_000, 'B': 1_000_000_000}
    multiplier = multipliers.get(multiplier_str, 1)
    
    return base_value * multiplier

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

        # Call AI Engine Classifier Agent
        try:
            print(f"[Curator] Calling AI-Engine Classify for: {title[:30]}...")
            response = requests.post(
                f"{AI_ENGINE_URL}/ai/classify",
                json={
                    "raw_text": full_text,
                    "source": raw_item.get("source", "Unknown"),
                    "model": "llama-3.3-70b-versatile" # Specify the model to use
                },
                timeout=45
            )

            if response.status_code == 200:
                refined = response.json().get("data", {}) # Assign result to 'refined' for consistency
                
                if not refined.get("is_opportunity"):
                    print(f"  [Curator] Skipped: {title[:30]} (Not an opportunity)")
                    return None
                
                print(f"  [Curator] Success: {refined.get('title')}")
                
                deadline_dt = None
                if refined.get("deadline"):
                    try:
                        deadline_dt = datetime.strptime(refined["deadline"], "%Y-%m-%d")
                    except: pass

                # --- Execute AI Risk Assessment ---
                risk_score = None
                risk_level = None
                risk_flags = []
                try:
                    print(f"[Curator] Calling AI-Engine Risk-Assess for: {title[:30]}...")
                    opp_data_for_risk = {
                        "title": refined.get("title", title),
                        "description": text, # Raw text gives better context for scams
                        "category": refined.get("category", "Uncategorized"),
                        "source": raw_item.get("source", "Unknown"),
                        "url": raw_item.get("url", ""),
                        "reward_pool": refined.get("reward_pool", "")
                    }
                    risk_resp = requests.post(
                        f"{AI_ENGINE_URL}/ai/risk-assess",
                        json={
                            "opportunity": opp_data_for_risk,
                            "ecosystem": None
                        },
                        timeout=30
                    )
                    if risk_resp.status_code == 200:
                        risk_data = risk_resp.json().get("data", {})
                        risk_score = risk_data.get("risk_score")
                        risk_level = risk_data.get("risk_level")
                        risk_flags = risk_data.get("flags", [])
                except Exception as risk_e:
                    print(f"  [Curator] Risk Assess Error: {risk_e}")

                raw_item.update({
                    "title": refined.get("title", title),
                    "category": refined.get("category", "Uncategorized"),
                    "reward_pool": refined.get("reward_pool"),
                    "estimated_value_usd": parse_reward_to_usd(refined.get("reward_pool", "")),
                    "deadline": deadline_dt,
                    "chain": refined.get("chain", "Multi-chain"),
                    "required_skills": refined.get("required_skills", []),
                    "win_probability": refined.get("win_probability", "Medium"),
                    "difficulty": refined.get("difficulty", "Intermediate"),
                    "ai_summary": refined.get("ai_summary"),
                    "ai_strategy": refined.get("strategy_tip"),
                    "ai_score": (90 if refined.get("win_probability") == "High" else 70) + (len(refined.get("required_skills", [])) * 2),
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "risk_flags": risk_flags
                })
                return raw_item
            else:
                print(f"  [Curator] API Error {response.status_code}: {response.text}")
                return None

        except Exception as e:
            print(f"  [Curator] Exception: {e}")
            print("  [Curator] Falling back to raw item (Bypassing AI)...")
            # Fallback: Return raw item without AI enrichment
            return raw_item
