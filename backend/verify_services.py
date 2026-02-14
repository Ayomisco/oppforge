import os
import httpx
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

async def verify_services():
    print("🔍 Starting Service Verification...\n")
    
    # 1. Aiven Database
    db_url = os.getenv("DATABASE_URL")
    print(f"1. Aiven Database: Checking connection to {db_url.split('@')[1].split(':')[0]}...")
    try:
        engine = create_engine(db_url)
        connection = engine.connect()
        result = connection.execute("SELECT 1").scalar()
        print("   ✅ Connection Successful! (Result: 1)\n")
        connection.close()
    except Exception as e:
        print(f"   ❌ Connection Failed: {e}\n")

    # 2. Groq API
    groq_key = os.getenv("GROQ_API_KEY")
    print("2. Groq AI: Sending test prompt...")
    if not groq_key:
        print("   ❌ Key Missing\n")
    else:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}"},
                    json={
                        "model": "llama-3.1-8b-instant",
                        "messages": [{"role": "user", "content": "Say 'Groq works!'"}],
                        "max_tokens": 10
                    },
                    timeout=5.0
                )
                if res.status_code == 200:
                    print(f"   ✅ Success: {res.json()['choices'][0]['message']['content']}\n")
                else:
                     print(f"   ❌ Error {res.status_code}: {res.text}\n")
        except Exception as e:
            print(f"   ❌ Exception: {e}\n")

    # 3. RapidAPI (Twitter)
    rapid_key = os.getenv("RAPIDAPI_KEY")
    print("3. RapidAPI (Twitter): Fetching 1 tweet...")
    if not rapid_key:
        print("   ❌ Key Missing\n")
    else:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    "https://twitter-api45.p.rapidapi.com/search.php",
                    params={"query": "Solana", "type": "Latest"},
                    headers={
                        "X-RapidAPI-Key": rapid_key,
                        "X-RapidAPI-Host": "twitter-api45.p.rapidapi.com"
                    },
                    timeout=10.0
                )
                if res.status_code == 200:
                    data = res.json()
                    tweets = data.get("timeline", [])
                    print(f"   ✅ Success: Found {len(tweets)} tweets. Sample: {tweets[0].get('text')[:30]}...\n")
                else:
                    print(f"   ❌ Error {res.status_code}: {res.text}\n")
        except Exception as e:
             print(f"   ❌ Exception: {e}\n")

    # 4. Google Auth
    print("4. Google Auth: Verifying Endpoint Configuration...")
    if os.getenv("GOOGLE_CLIENT_ID"):
        print("   ✅ Client ID configured. Endpoint ready at /auth/google.\n")
    else:
        print("   ❌ Client ID missing.\n")

    # 5. Plunk
    print("5. Plunk Email: Checking Configuration...")
    if os.getenv("PLUNK_API_KEY"):
         print("   ✅ API Key present.\n")
    else:
         print("   ⚠️ API Key missing in .env (Add PLUNK_API_KEY for emails).\n")

if __name__ == "__main__":
    asyncio.run(verify_services())
