import subprocess
import sys
import os

def run_test(name, path, url):
    print(f"\n" + "="*50)
    print(f"🚀 RUNNING {name.upper()} TESTS...")
    print("="*50)
    try:
        # Run the respective test script
        result = subprocess.run([sys.executable, path, url], capture_output=False)
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Failed to run {name} tests: {str(e)}")
        return False

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Backend Tests
    backend_script = os.path.join(root_dir, "backend", "test_api.py")
    backend_url = "http://localhost:8000"
    
    # AI Engine Tests
    ai_script = os.path.join(root_dir, "ai-engine", "test_engine.py")
    ai_url = "http://localhost:8001"
    
    results = {}
    
    if os.path.exists(backend_script):
        results["backend"] = run_test("Backend", backend_script, backend_url)
    
    if os.path.exists(ai_script):
        results["ai-engine"] = run_test("AI Engine", ai_script, ai_url)
    
    print(f"\n" + "="*50)
    print(f"📊 SUMMARY OF MISSION STATUS")
    print("="*50)
    for service, status in results.items():
        icon = "✅ ACTIVE" if status else "❌ OFFLINE/ERROR"
        print(f"{service.upper()}: {icon}")
    print("="*50)

if __name__ == "__main__":
    main()
