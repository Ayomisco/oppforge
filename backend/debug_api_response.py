import requests
import json

def debug_api():
    try:
        # Fetch list
        print("Fetching /opportunities/priority...")
        # Need auth usually, but let's try open endpoint first or login
        # Priority endpoint requires auth: user = Depends(get_current_user)
        # So we should try /opportunities/ instead which might be open or check trending
        
        # Try open endpoints that return lists
        endpoints = [
            "http://localhost:8000/opportunities/",
            "http://localhost:8000/opportunities/trending",
            "http://localhost:8000/opportunities/testnets"
        ]
        
        for url in endpoints:
            print(f"\n--- Checking {url} ---")
            res = requests.get(url)
            if res.status_code == 200:
                data = res.json()
                if not data:
                    print("No data found.")
                    continue
                
                print(f"Found {len(data)} items.")
                missing_ids = 0
                null_ids = 0
                
                for i, item in enumerate(data):
                    if "id" not in item:
                        missing_ids += 1
                        print(f"Item {i} MISSING 'id': {item.keys()}")
                    elif item["id"] is None:
                        null_ids += 1
                        print(f"Item {i} has NULL 'id'")
                        
                if missing_ids == 0 and null_ids == 0:
                    print("ALL items have valid IDs.")
                    print(f"First ID: {data[0].get('id')}")
                else:
                    print(f"ISSUES FOUND: Missing={missing_ids}, Null={null_ids}")
            else:
                print(f"Error fetching: {res.status_code} {res.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_api()
