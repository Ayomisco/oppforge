import os
import httpx
import asyncio
from sqlalchemy import text
from app.database import SessionLocal

async def test_services():
    print("🧪 Testing External Services...\n")

    # 1. Database (Aiven)
    try:
        db = SessionLocal()
        result = db.execute(text("SELECT version();")).fetchone()
        print(f"✅ Database (Aiven): Connected. Version: {result[0]}")
        db.close()
    except Exception as e:
        print(f"❌ Database (Aiven): Failed. Error: {e}")

    # 2. Groq AI
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": "Ping"}]
                    }
                )
                if res.status_code == 200:
                    print("✅ Groq AI: Working. Response received.")
                else:
                    print(f"❌ Groq AI: Failed. Status: {res.status_code}")
        except Exception as e:
            print(f"❌ Groq AI: Error: {e}")
    else:
        print("⚠️ Groq AI: Skipped (No Key)")

    # 3. RapidAPI (Twitter)
    rapid_key = os.getenv("RAPIDAPI_KEY")
    if rapid_key:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    "https://twitter-api45.p.rapidapi.com/search.php",
                    headers={
                        "X-RapidAPI-Key": rapid_key,
                        "X-RapidAPI-Host": "twitter-api45.p.rapidapi.com"
                    },
                    params={"query": "test", "type": "Latest"}
                )
                if res.status_code == 200:
                    print("✅ RapidAPI (Twitter): Working.")
                else:
                    print(f"❌ RapidAPI (Twitter): Failed. Status: {res.status_code}")
        except Exception as e:
            print(f"❌ RapidAPI (Twitter): Error: {e}")
    else:
        print("⚠️ RapidAPI: Skipped (No Key)")

    # 4. Plunk (Email)
    # We won't send an email, just check if key exists and maybe ping API (no public ping, assume working if key)
    # Plunk API is simple: https://api.useplunk.com
    # We'll just print status.
    plunk_key = os.getenv("PLUNK_API_KEY") # User didn't provide this in env dump, checking if it's there
    if plunk_key:
         print("✅ Plunk (Email): Configured.")
    else:
         print("⚠️ Plunk (Email): Skipped (No PLUNK_API_KEY in .env)")

if __name__ == "__main__":
    asyncio.run(test_services())
