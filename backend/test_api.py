import requests
import json
import sys

def check_health(base_url):
    print(f"🔍 Checking Backend Health at {base_url}...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print(f"✅ Backend Online: {response.json()}")
            return True
        else:
            print(f"❌ Backend Healthy check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Could not connect to Backend: {str(e)}")
        return False

def verify_public_endpoints(base_url):
    print(f"\n🔍 Verifying Public Endpoints...")
    endpoints = [
        "/opportunities/priority",
        "/stats/dashboard",
    ]
    
    for ep in endpoints:
        try:
            res = requests.get(f"{base_url}{ep}")
            if res.status_code == 200:
                print(f"✅ {ep}: OK ({len(res.json()) if isinstance(res.json(), list) else 'Object'} results)")
            elif res.status_code == 401:
                print(f"⚠️ {ep}: Locked (Requires Auth - OK for public test)")
            else:
                print(f"❌ {ep}: Error {res.status_code}")
        except Exception as e:
            print(f"❌ {ep}: Connection Error")

if __name__ == "__main__":
    url = "http://localhost:8000"
    if len(sys.argv) > 1:
        url = sys.argv[1]
    
    if check_health(url):
        verify_public_endpoints(url)
