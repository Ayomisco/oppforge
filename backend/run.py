import uvicorn
import os

if __name__ == "__main__":
    # Railway provides the PORT environment variable
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting OppForge Backend on 0.0.0.0:{port}")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )
