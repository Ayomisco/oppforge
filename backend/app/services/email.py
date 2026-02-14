import requests
import os

PLUNK_API_KEY = "sk_a4315e3be4181fd33525775a02cba709c939eb83f61d3caa" # Usually limit this to env, but user provided explicitly

def send_email(to_email: str, subject: str, body: str):
    """
    Send email via Plunk API.
    """
    try:
        response = requests.post(
            "https://api.useplunk.com/v1/send",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {PLUNK_API_KEY}"
            },
            json={
                "to": to_email,
                "subject": subject,
                "body": body,
                "name": "OppForge System"
            }
        )
        if response.status_code == 200:
            return True, "Email sent"
        else:
            return False, f"Error: {response.text}"
    except Exception as e:
        return False, str(e)

def send_welcome_email(user_email: str, name: str):
    subject = "Welcome to OppForge! ⚒️"
    body = f"""
    Hi {name},
    
    Welcome to OppForge - The AI Agent for Web3 Opportunities.
    
    We're excited to help you find your next grant, gig, or airdrop.
    
    Best,
    The OppForge Team
    """
    return send_email(user_email, subject, body)
