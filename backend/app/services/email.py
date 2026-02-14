import httpx
import os
from typing import List, Optional

PLUNK_API_KEY = os.getenv("PLUNK_SECRET_KEY")
API_URL = "https://api.useplunk.com/v1/send"

def get_email_template(title: str, body: str, cta_link: str = None, cta_text: str = "View Opportunity"):
    """
    Returns a branded HTML email template (Dark Mode).
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #0F172A;
                color: #E2E8F0;
                margin: 0;
                padding: 0;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #1E293B;
                border: 1px solid #334155;
                border-radius: 8px;
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%);
                padding: 24px;
                text-align: center;
            }}
            .header h1 {{
                color: #FFFFFF;
                margin: 0;
                font-size: 24px;
                letter-spacing: -0.025em;
            }}
            .content {{
                padding: 32px 24px;
            }}
            .content h2 {{
                color: #F8FAFC;
                margin-top: 0;
                font-size: 20px;
            }}
            .content p {{
                color: #CBD5E1;
                line-height: 1.6;
                font-size: 16px;
                margin-bottom: 24px;
            }}
            .cta-button {{
                display: inline-block;
                background-color: #3B82F6;
                color: #FFFFFF;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
                margin-top: 16px;
            }}
            .cta-button:hover {{
                background-color: #2563EB;
            }}
            .footer {{
                background-color: #0F172A;
                padding: 24px;
                text-align: center;
                font-size: 12px;
                color: #64748B;
                border-top: 1px solid #334155;
            }}
            .badge {{
                display: inline-block;
                padding: 4px 8px;
                background-color: #334155;
                color: #94A3B8;
                border-radius: 4px;
                font-size: 12px;
                margin-right: 8px;
            }}
        </style>
    </head>
    <body>
        <div style="padding: 40px 16px;">
            <div class="container">
                <div class="header">
                    <h1>OppForge</h1>
                </div>
                <div class="content">
                    <h2>{title}</h2>
                    <p>{body}</p>
                    {f'<a href="{cta_link}" class="cta-button">{cta_text}</a>' if cta_link else ''}
                </div>
                <div class="footer">
                    <p>OppForge - The AI-Powered Web3 Opportunity Aggregator</p>
                    <p>You received this because you enabled notifications in your preferences.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

async def send_email(to_email: str, subject: str, html_body: str, name: str = "OppForge"):
    """
    Send an email via Plunk API.
    """
    if not PLUNK_API_KEY:
        print(f"[Email] No API Key. Would have sent to {to_email}: {subject}")
        return False

    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "to": to_email,
                "subject": subject,
                "body": html_body, # Plunk accepts HTML in body
                "name": name,
                "from": "hello@oppforge.xyz" 
            }
            
            response = await client.post(
                API_URL,
                headers={"Authorization": f"Bearer {PLUNK_API_KEY}"},
                json=payload
            )
            
            if response.status_code == 200:
                print(f"[Email] Sent to {to_email}")
                return True
            else:
                print(f"[Email] Error {response.status_code}: {response.text}")
                return False
        except Exception as e:
            print(f"[Email] Exception: {e}")
            return False
