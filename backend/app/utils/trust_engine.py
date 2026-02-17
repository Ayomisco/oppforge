import requests
from typing import Dict, List
import socket
from datetime import datetime

class TrustEngine:
    """
    The Anti-Deception Engine for OppForge.
    Calculates a 'Trust Score' for missions based on forensic signals.
    """
    
    @staticmethod
    def calculate_score(opp_data: Dict) -> int:
        score = 80 # Default starting score
        
        url = opp_data.get('url', '')
        source = opp_data.get('source', '').lower()
        title = opp_data.get('title', '').lower()
        
        # 🛡️ Signal 1: Source Reputation
        if source == 'manual':
            return 100 # Admin verified
        if source in ['gitcoin', 'devpost', 'devfolio']:
            score += 10 # Platforms have their own vetting
            
        # 🛡️ Signal 2: Metadata Richness
        if not opp_data.get('description') or len(opp_data.get('description', '')) < 50:
            score -= 15 # Sparse data is risky
            
        # 🛡️ Signal 3: URL Forensic (Basic)
        if 't.me/' in url or 'discord.gg' in url:
            # Direct social links are lower trust than official landing pages
            score -= 5
            
        # 🛡️ Signal 4: Keyphrase Risk
        risk_keywords = ['guaranteed', 'doubler', 'invest now', 'send money', 'seed phrase']
        if any(kw in title for kw in risk_keywords):
            score -= 40
            
        # 🛡️ Signal 5: Domain Freshness (Optional - requires API or whois)
        # For now, let's just do a reachability check
        try:
            domain = url.split('//')[-1].split('/')[0]
            socket.gethostbyname(domain)
        except:
            score -= 30 # Domain doesn't resolve? High risk.

        return max(0, min(100, score))

    @staticmethod
    def inspect_consensus(title: str, seen_titles: List[str]) -> bool:
        """
        Check if we've seen this title elsewhere. 
        Higher consensus = Higher trust.
        """
        # Simple string match for now
        matches = [s for s in seen_titles if title.lower() in s.lower()]
        return len(matches) > 1
