
import re
import hashlib
from urllib.parse import urlparse, urlunparse

def normalize_url(url: str) -> str:
    """
    Normalizes a URL by removing tracking parameters and standardizing protocol.
    """
    if not url: return ""
    try:
        parsed = urlparse(url)
        # Force HTTP/HTTPS
        scheme = parsed.scheme if parsed.scheme in ["http", "https"] else "https"
        # Standardize netloc (remove www.)
        netloc = parsed.netloc.lower().replace("www.", "")
        # Remove query params often used for tracking (utm_*, ref, etc.)
        # Keep path as is, but maybe remove trailing slash?
        path = parsed.path.rstrip("/")
        
        # New clean query params (whitelist essential ones if known, or just strip all non-essential)
        # For opportunities, usually query params are NOT part of the unique resource ID unless it's a search result page.
        # But some sites use ID as query param (e.g. ?id=123).
        # Heuristic: Remove UTM, FBCLID, REF 
        keep_params = []
        if parsed.query:
            params = parsed.query.split("&")
            for p in params:
                key = p.split("=")[0].lower()
                if not any(x in key for x in ["utm_", "fbclid", "ref", "source", "trk"]):
                    keep_params.append(p)
        
        query = "&".join(keep_params)
        
        # Reconstruct
        return urlunparse((scheme, netloc, path, parsed.params, query, ""))
    except:
        return url

def generate_content_hash(text: str) -> str:
    """
    Generates a SHA256 hash of the normalized text content.
    Used to detect duplicate opportunities with different URLs.
    """
    if not text: return ""
    # Normalize: lowercase, remove non-alphanumeric, strip whitespace
    clean = re.sub(r'[^a-zA-Z0-9]', '', text.lower())
    return hashlib.sha256(clean.encode('utf-8')).hexdigest()

from datetime import datetime

COMMON_SKILLS = [
    "Rust", "Solidity", "Python", "TypeScript", "React", "Next.js", "Go", "C++", 
    "Move", "Cairo", "Vyper", "ZK", "Zero Knowledge", "DeFi", "NFT", "DAO", 
    "Smart Contract", "Frontend", "Backend", "Fullstack", "Mobile", "iOS", "Android"
]

def extract_deadline(text: str):
    """
    Extracts deadline using regex patterns.
    Returns ISO date string (YYYY-MM-DD) or None.
    """
    if not text: return None
    
    # Patterns for deadlines
    patterns = [
        r"(?:deadline|closing|apply by|ends|until):?\s*([a-zA-Z]{3,9}\s\d{1,2},?\s?\d{4})", # Deadline: March 15, 2024
        r"(?:deadline|closing|apply by|ends|until):?\s*(\d{1,2}/\d{1,2}/\d{4})", # Apply by: 01/01/2024
        r"(?:deadline|closing|apply by|ends|until):?\s*(\d{4}-\d{2}-\d{2})", # Ends: 2024-01-01
        r"due:?\s*([a-zA-Z]{3,9}\s\d{1,2})", # Due March 15
    ]
    
    for pat in patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            try:
                from dateutil import parser
                dt = parser.parse(date_str)
                # If year is missing (e.g. "March 15"), assume current year (2026) or next year
                if dt.year == 1900: # specific to some dateutil defaults
                     now = datetime.now()
                     dt = dt.replace(year=now.year)
                     if dt < now: dt = dt.replace(year=now.year + 1)
                
                return dt.date().isoformat()
            except:
                 pass
                 
    return None

def extract_reward_pool(text: str) -> str:
    """Extracts monetary values or token amounts."""
    if not text: return None
    
    # Matches $1000, $1k, $1.5M, 500 USDC, 10 ETH
    patterns = [
        r"\$([\d,]+(?:\.\d+)?(?:k|m|b)?)", 
        r"([\d,]+(?:\.\d+)?)\s?(?:USDC|USDT|ETH|SOL|BTC|tokens)",
        r"prize pool:?\s?\$?([\d,]+(?:\.\d+)?(?:k|m|b)?)",
    ]
    
    for pat in patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
             # Basic formatting
             val = match.group(0) # Returns the full match like "$5000" or "10 ETH"
             return val.upper()
             
    return None

def extract_skills(text: str) -> list[str]:
    """Extracts skills from text based on a predefined list."""
    if not text: return []
    found = []
    text_lower = text.lower()
    
    for skill in COMMON_SKILLS:
        # Simple word boundary check
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
            found.append(skill)
            
    return list(set(found))

def is_opportunity_fresh(date_str: str) -> bool:
    """Checks if opportunity is from 2026 onwards."""
    if not date_str: return False
    try:
        dt = datetime.fromisoformat(str(date_str))
        return dt.year >= 2026
    except:
        return False
