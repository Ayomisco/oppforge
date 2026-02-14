import httpx
import os
import asyncio

async def debug_rapidapi():
    key = os.getenv("RAPIDAPI_KEY", "0ee1baaeccmsh0ffa9b259bb3f32p188926jsnf94fa2b16be1")
    print(f"Testing Key: {key[:10]}...")
    
    hosts = [
        "twitter-api45.p.rapidapi.com",
        "twitter154.p.rapidapi.com",
        "twitter-x.p.rapidapi.com"
    ]
    
    async with httpx.AsyncClient() as client:
        for host in hosts:
            print(f"\n--- Testing Host: {host} ---")
            try:
                # URL structure varies, but many use /search.php or /search
                # twitter154 uses /search/search
                # twitter-api45 uses /search.php
                
                url = f"https://{host}/search.php"
                if "154" in host: url = f"https://{host}/search/search"
                if "twitter-x" in host: url = f"https://{host}/search/parse" # Guessing
                
                params = {"query": "solana", "type": "Latest", "section": "top"}
                
                res = await client.get(
                    url,
                    headers={
                        "X-RapidAPI-Key": key,
                        "X-RapidAPI-Host": host
                    },
                    params=params, 
                    timeout=5.0
                )
                print(f"Status: {res.status_code}")
                if res.status_code == 200:
                    print("SUCCESS! This host works.")
                    print(res.json().keys() if res.json() else "Empty JSON")
                else:
                    print(f"Response: {res.text[:100]}")
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_rapidapi())
