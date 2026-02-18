# Google OAuth Login Issue - Diagnosis & Fix Guide

**Date**: February 17, 2026  
**Issue**: Unable to login via Google Auth (was working before)

---

## 🔍 Diagnosis

### Configuration Check ✅
1. **Backend (.env)**:
   - `GOOGLE_CLIENT_ID`: ✅ Set correctly
   - `GOOGLE_CLIENT_SECRET`: ✅ Set correctly

2. **Frontend (platform/.env)**:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: ✅ Set correctly (matches backend)

3. **Backend Dependencies**:
   - `google-auth` ✅ Installed
   - `google-auth-oauthlib` ✅ Installed
   - Library imports working ✅

4. **Frontend Dependencies**:
   - `@react-oauth/google` - Need to verify

---

## 🐛 Common Causes & Solutions

### Issue 1: Google OAuth Library Not Installed (Frontend)
**Symptom**: Google login button not showing or clicking does nothing

**Fix**:
```bash
cd platform
npm install @react-oauth/google
npm run dev
```

---

### Issue 2: Authorized Redirect URIs Not Configured
**Symptom**: After clicking Google button, error "redirect_uri_mismatch"

**Fix**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → Credentials
3. Click on your OAuth 2.0 Client ID
4. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:3001
   http://localhost:3000
   ```
5. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3001
   http://localhost:3000
   http://localhost:3001/login
   http://localhost:3000/login
   ```
6. Click "Save"
7. Wait 5 minutes for changes to propagate

---

### Issue 3: Backend Not Running
**Symptom**: Network error or "Failed to fetch" in console

**Fix**:
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not running, start it
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

---

### Issue 4: CORS Issues
**Symptom**: CORS error in browser console

**Fix**: Check `backend/app/main.py` CORS configuration:
```python
# Should include your frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",  # If you use different port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Issue 5: Cookie Issues
**Symptom**: Logs in but immediately logs out

**Fix**:
```javascript
// Check browser console for errors
// Clear cookies and try again
document.cookie.split(";").forEach(c => {
    document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
});
// Then refresh and try logging in again
```

---

### Issue 6: Token Expiration / Invalid Token
**Symptom**: "Invalid token" error in backend

**Possible Causes**:
- Google token expired (tokens expire in 1 hour)
- Clock skew between client and server
- Token verification failing

**Fix**:
1. Make sure system time is correct
2. Check backend logs for specific error:
   ```bash
   tail -f backend/logs/backend.log
   ```
3. Test token verification manually:
   ```bash
   cd backend
   source venv/bin/activate
   python3 -c "
   from google.oauth2 import id_token
   from google.auth.transport import requests
   import os
   from dotenv import load_dotenv
   
   load_dotenv()
   GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
   print(f'Client ID: {GOOGLE_CLIENT_ID[:20]}...')
   print('Token verification setup OK')
   "
   ```

---

### Issue 7: Database Connection Issues
**Symptom**: Login fails with 500 error

**Fix**:
```bash
# Test database connection
cd backend
source venv/bin/activate
python3 -c "
from app.database import SessionLocal
from app.models.user import User
db = SessionLocal()
print(f'✅ Database connected. Users: {db.query(User).count()}')
db.close()
"
```

---

## 🔧 Step-by-Step Troubleshooting

### Step 1: Check Frontend Console
```bash
# Open browser console (F12)
# Click Google login button
# Look for errors:
```

Common errors:
- `popup_closed_by_user` - User closed popup (normal)
- `idpiframe_initialization_failed` - Cookie/3rd party cookie blocked
- `Network Error` - Backend not reachable
- `401 Unauthorized` - Token verification failed
- `CORS error` - CORS not configured

---

### Step 2: Check Backend Logs
```bash
cd backend
tail -f logs/backend.log

# Or if using nohup
tail -f nohup.out
```

Look for:
- `ValueError: Invalid token` - Token verification failed
- `Database error` - Database issue
- No logs - Backend not receiving request (CORS or connection issue)

---

### Step 3: Test Backend Auth Endpoint Manually
```bash
# This won't work with a real token, but will show if endpoint is accessible
curl -X POST http://localhost:8000/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "test_token"}'

# Expected: {"detail": "Invalid token: ..."}
# If you get this, endpoint is working
```

---

### Step 4: Verify Environment Variables
```bash
# Backend
cd backend
source venv/bin/activate
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()
client_id = os.getenv('GOOGLE_CLIENT_ID')
print(f'Backend Client ID: {client_id[:30]}...' if client_id else 'NOT SET')
"

# Frontend
cd platform
cat .env.local | grep GOOGLE || cat .env | grep GOOGLE
```

Both should show the SAME Client ID.

---

### Step 5: Check Google OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: APIs & Services → OAuth consent screen
3. Make sure:
   - Publishing status: **Testing** or **In production**
   - Test users: Your email added (if in Testing mode)
   - Scopes: email, profile, openid

---

## 🚑 Quick Fix Script

Save this as `debug_google_auth.sh`:

```bash
#!/bin/bash

echo "🔍 OppForge Google Auth Diagnostic"
echo "=================================="

# 1. Check backend
echo "\n1️⃣ Checking Backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is NOT running"
    echo "   Start with: cd backend && uvicorn app.main:app --reload"
fi

# 2. Check frontend
echo "\n2️⃣ Checking Frontend..."
if lsof -i :3001 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3001"
else
    echo "❌ Frontend is NOT running"
    echo "   Start with: cd platform && npm run dev"
fi

# 3. Check Google Client ID
echo "\n3️⃣ Checking Google Client ID..."
cd backend
source venv/bin/activate
BACKEND_ID=$(python3 -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('GOOGLE_CLIENT_ID', 'NOT_SET'))")
cd ../platform
FRONTEND_ID=$(grep NEXT_PUBLIC_GOOGLE_CLIENT_ID .env.local 2>/dev/null || grep NEXT_PUBLIC_GOOGLE_CLIENT_ID .env 2>/dev/null | cut -d'=' -f2)

if [ "$BACKEND_ID" = "$FRONTEND_ID" ]; then
    echo "✅ Client IDs match"
else
    echo "❌ Client IDs DO NOT match"
    echo "   Backend: ${BACKEND_ID:0:30}..."
    echo "   Frontend: ${FRONTEND_ID:0:30}..."
fi

# 4. Test token verification
echo "\n4️⃣ Testing Google OAuth library..."
cd ../backend
python3 -c "from google.oauth2 import id_token; print('✅ Google OAuth library working')" 2>&1 | head -1

echo "\n=================================="
echo "✅ Diagnostic complete"
echo "\nNext steps:"
echo "1. Open browser console (F12)"
echo "2. Go to http://localhost:3001/login"
echo "3. Click Google login"
echo "4. Check for errors in console"
echo "5. Check backend logs: tail -f backend/logs/backend.log"
```

Run with:
```bash
chmod +x debug_google_auth.sh
./debug_google_auth.sh
```

---

## 📱 Browser-Specific Issues

### Chrome
- Check if 3rd party cookies are blocked
- Go to: `chrome://settings/cookies`
- Allow "Sites can use third-party cookies"

### Firefox
- Go to: `about:preferences#privacy`
- Set "Enhanced Tracking Protection" to "Standard"

### Safari
- Go to: Preferences → Privacy
- Uncheck "Prevent cross-site tracking"

---

## 🔒 Security Checklist

After fixing auth, verify:
- [ ] CORS is restricted to your domains (not allow_origins=["*"])
- [ ] JWT SECRET_KEY is not the default
- [ ] HTTPS in production
- [ ] Secure cookies in production (`secure=True, httpOnly=True`)

---

## 📞 Still Not Working?

If you've tried everything above and Google auth still doesn't work:

1. **Check Google Cloud Console for errors**:
   - Go to: APIs & Services → Dashboard
   - Look for any quota/rate limit warnings

2. **Create a new OAuth Client**:
   - Sometimes the old one gets corrupted
   - Create fresh credentials and update .env files

3. **Check if email is verified on Google**:
   - Login might fail if Google account email is unverified

4. **Browser cache**:
   ```javascript
   // Open console and run:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

5. **Contact me with**:
   - Browser console error (screenshot)
   - Backend logs (last 50 lines)
   - Output of diagnostic script

---

**Last Updated**: February 17, 2026  
**Status**: Diagnostic guide complete
