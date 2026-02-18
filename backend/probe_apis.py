import httpx
import asyncio

async def probe_endpoints():
    endpoints = [
        ("DoraHacks", "https://dorahacks.io/api/hackathon/list"),
        ("DoraHacks V2", "https://dorahacks.io/api/v1/hackathon/list"), 
        ("Superteam", "https://earn.superteam.fun/api/listings"),
        ("Superteam V2", "https://earn.superteam.fun/api/trpc/listings.getList"),
        ("Questbook", "https://api.questbook.app/v1/grants"),
        ("HackQuest", "https://api.hackquest.io/v1/hackathons")
    ]
    
    async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client:
        for name, url in endpoints:
            try:
                print(f"--- Probing {name} ---")
                resp = await client.get(url)
                print(f"URL: {url}")
                print(f"Status: {resp.status_code}")
                if resp.status_code == 200:
                    print(f"Success! Keys: {list(resp.json().keys())[:5]}")
                    data = resp.json()
                    if isinstance(data, list) and len(data) > 0:
                        print(f"Sample: {data[0]}")
                    elif isinstance(data, dict):
                         print(f"Structure: {str(data)[:100]}")
                else:
                    print(f"Failed. Response: {resp.text[:200]}")
            except Exception as e:
                print(f"Error: {e}")
            print("\n")

if __name__ == "__main__":
    asyncio.run(probe_endpoints())
