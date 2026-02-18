# Dashboard Fixes Applied

## Issues Fixed

### 1 Onboarding Redirect Issue. 
**Problem:** Users who already completed onboarding were being asked to onboard again.

**Root Cause:** The `onboarded` flag wasn't being set to `True` for users who filled their profile.

**Solution:**
- Created script `backend/app/scripts/fix_dashboard_issues.py`
- Script automatically sets `onboarded=True` for users with skills or preferred chains
- Fixed 1 user (john@oppforge.xyz) who had filled profile but wasn't marked as onboarded

**Test:**
```bash
cd backend
source venv/bin/activate
python -m app.scripts.fix_dashboard_issues
```

### 2 Admin Menu Not Showing. 
**Problem:** Admin users couldn't see "Intelligence HQ" menu with "Deploy Mission" and "Audit Logs".

**Root Cause:** 
- Backend sends role as enum: `UserRole.ADMIN` 
- Frontend checked: `user?.role?.toLowerCase() === 'admin'`
- Enum objects don't have a proper `toLowerCase()` method

**Solution:**
- Updated `Sidebar.jsx` line 90 to handle all role formats:
  ```javascript
  {(user?.role === 'admin' || user?.role === 'ADMIN' || user?.role?.toLowerCase?.() === 'admin') && (
  ```
- Updated `UserResponse` schema to convert enum to string value in API response
- Now admin menu shows for any user with role="admin" (case-insensitive)

**Affected Users:**
- fayomide324@gmail.com (ADMIN, onboarded)
- admin@oppforge.xyz (ADMIN, not onboarded)

### 3 Dashboard Empty (No Opportunities). 
**Database Status:**
- 11 opportunities in database (all open)
- Sample: "Solana Foundation Renaissance Hackathon"

**Potential Issues Checked:**
-  Backend running on port 8000
-  Opportunities exist in database
-  All opportunities marked as `is_open=True`
-  `/opportunities/priority` endpoint should be working

**If Dashboard Still Empty, Check:**
1. Open browser console (F12) for errors
2. Check Network tab for failed API calls
3. Verify auth token is being sent: 
   ```bash
   # Get your token from browser cookies/localStorage
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/opportunities/priority
   ```

### 4 AI Engine Import Error. 
**Problem:** Running `uvicorn app.main:app` caused `ModuleNotFoundError: No module named 'app'`

**Root Cause:** AI Engine uses flat structure (main.py in root), not nested app/ directory

**Solution:**
- Don't use `uvicorn app.main:app`
- Use one of these instead:
  ```bash
  # Option 1: Use startup script
  cd ai-engine
  ./start.sh
  
  # Option 2: Run main.py directly
  cd ai-engine
  source venv/bin/activate
  python main.py
  
  # Option 3: Use new run.py wrapper
  cd ai-engine
  source venv/bin/activate
  python run.py
  ```

## Testing Instructions

### Test Onboarding Fix
1. Login with user who has filled profile
2. Should go directly to dashboard (not onboarding)
3. If redirected to onboarding, check browser console and run fix script

### Test Admin Menu
1. Login with admin account (fayomide324@gmail.com or admin@oppforge.xyz)
2. Check left sidebar
3. Should see "Intelligence HQ" section with:
   - "Deploy Mission" button
   - "Audit Logs" link
4. If not visible, open browser console and check `user.role` value

### Test Dashboard Opportunities
1. Login to dashboard
2. Should see opportunity cards
3. Each card should show:
   - Title
   - Reward pool
   - Deadline
   - Match score
   - Tags
4. If empty:
   - Check browser console (F12)
   - Check Network tab for `/opportunities/priority` request
   - Verify backend is running: `curl http://localhost:8000/health`

### Test AI Engine
1. Check it's running:
   ```bash
   curl http://localhost:8001/health
   ```
2. Should return: `{"status":"operational","version":"1.0.0","timestamp":"..."}`
3. Test scoring:
   ```bash
   curl -X POST http://localhost:8001/score \
     -H "Content-Type: application/json" \
     -d '{
       "opportunity": {
         "title": "Solana Hackathon",
         "description": "Build on Solana",
         "category": "hackathon"
       },
       "user_profile": {
         "skills": ["Rust", "Solana"],
         "preferred_chains": ["Solana"]
       }
     }'
   ```

## Database Stats

**Users:**
- Total: 4 users
- Admins: 2 (fayomide324@gmail.com, admin@oppforge.xyz)
- Onboarded: 2 (fayomide324@gmail.com, john@oppforge.xyz)

**Opportunities:**
- Total: 11
- Open: 11 (100%)
- Sources: Multiple (need to run scrapers for more data)

**Ecosystems:**
- Total: 114 seeded
- Tier 1: 30 ecosystems
- Tier 2: 33 ecosystems  
- Tier 3: 51 ecosystems

## Next Steps

1. **Run Scrapers** to populate more opportunities:
   ```bash
   cd backend
   source venv/bin/activate
   
   # Test individual scraper
   python -c "from app.scrapers.devpost import DevpostScraper; scraper = DevpostScraper(); opps = scraper.scrape(); print(f'Found {len(opps)} opportunities')"
   
   # Or use Celery (requires Redis):
   # celery -A app.celery_app worker --loglevel=info
   ```

2. **Test All Features:**
   - Apply to opportunity
   - Chat with AI assistant
   - View analytics
   - Check admin audit logs

3. **Security Hardening** (before production):
   - Rotate all API keys in .env
   - Change JWT SECRET_KEY
   - Add rate limiting
   - Restrict CORS origins
   - Add API key authentication

## Files Modified

- `platform/src/components/layout/Sidebar.jsx` - Fixed admin check
- `backend/app/schemas/user.py` - Added role enum to string conversion
- `backend/app/scripts/fix_dashboard_issues.py` - Created diagnostic tool
- `ai-engine/run.py` - Created proper startup wrapper

## Contact

If issues persist:
1. Check session checkpoints in `.copilot/session-state/`
2. Review logs: `backend/logs/`, `ai-engine/logs/`
3. Open browser DevTools and check Console + Network tabs
