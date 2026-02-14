import httpx
import os
from typing import List, Optional

PLUNK_API_KEY = os.getenv("PLUNK_SECRET_KEY")
API_URL = "https://api.useplunk.com/v1/send"

async def send_email(to_email: str, subject: str, body: str, name: str = "OppForge"):
    """
    Send an email via Plunk API.
    """
    if not PLUNK_API_KEY:
        print("Plunk: No API Key found. Skipping email.")
        return False

    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "to": to_email,
                "subject": subject,
                "body": body,
                "name": name,
                "from": "hello@oppforge.xyz" # Adjust if user has a verified domain
            }
            
            # Note: Plunk might require 'from' to be verified. 
            # If default fails, we might need a generic one or user's domain.
            
            response = await client.post(
                API_URL,
                headers={"Authorization": f"Bearer {PLUNK_API_KEY}"},
                json=payload
            )
            
            if response.status_code == 200:
                print(f"Plunk: Email sent to {to_email}")
                return True
            else:
                print(f"Plunk Error {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"Plunk Exception: {e}")
            return False
