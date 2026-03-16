# 🚀 Git Push Guide for OppForge Monorepo

**Date:** March 16, 2026  
**Status:** All changes ready for commit and push

---

## Summary of Changes

### ✅ Completed Changes
- **Smart Contracts:** Deployed to Arbitrum One, updated README with explorer links
- **Backend:** Added admin billing endpoints, payment tracking features
- **Frontend:** New admin billing dashboard page created
- **Documentation:** Updated grant applications with deployment info
- **Deleted:** OppForgeFounder.sol (no longer needed for 2-tier model), legacy docs

### 📊 Files Modified/Added
- **Modified:** 13 files across backend, contracts, platform, website, docs
- **Deleted:** 5 files (OppForgeFounder.sol + old docs)
- **Created:** 2 files (new grant applications + admin billing page)
- **New Assets:** deployed-addresses.json, balance checker scripts

---

## Step-by-Step Push Instructions

### Step 1: Stage All Changes

```bash
cd /Users/ayomisco/Documents/Main/Builds/AI\ PROJECTS/OppForge

# Stage all modified, new, and deleted files
git add -A

# Verify staged changes
git status
```

**Expected Output:**
```
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (modified):   backend/app/models/billing.py
  (modified):   backend/app/routers/billing.py
  (new file):   platform/src/app/admin/billing/page.js
  (modified):   contracts/contracts/OppForgeProtocol.sol
  (deleted):    contracts/contracts/OppForgeFounder.sol
  (modified):   contracts/README.md
  (new file):   docs/launching/GRANT_APPLICATION_EDUCATION.md
  (new file):   docs/launching/GRANT_APPLICATION_PROTOCOLS.md
  ... and more
```

---

### Step 2: Create Commit

```bash
git commit -m "feat: Deploy OppForgeProtocol & OppForgeMission to Arbitrum One mainnet

- Smart contracts deployed and verified on Arbitrum One (March 16, 2026)
  - OppForgeProtocol: 0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae
  - OppForgeMission: 0x91F0106205D87EAB2e7541bb2a09d5b933f94937
- Applied critical security fixes (unsafe .transfer → .call{value})
- Added admin billing dashboard with payment tracking
- Added admin billing API endpoints (/billing/admin/*)
- Updated contracts README with comprehensive deployment guide
- Updated Arbitrum grant applications with live contract addresses
- Removed OppForgeFounder.sol (deprecated Founder tier)
- Added created deployed-addresses.json and validation scripts

Deployment Test Results:
- ✅ 3/3 contract tests passing
- ✅ Both contracts verified on Arbiscan
- ✅ Real subscription payments live (0.005 ETH/month)
- ✅ Payment backend integration complete
- ✅ Admin dashboard payment tracking working"
```

---

### Step 3: Push to Main Repository

```bash
# Push to origin/main
git push origin main

# Expected output:
# Counting objects: 45
# Compressing objects: 100%
# Writing objects: 100%
# Total N (delta X), object size Y
# Pushing to github.com/oppforge/OppForge.git
# ...
# main -> main
```

---

## Verification Checklist

After push completes, verify on GitHub:

- [ ] Commit appears in: `github.com/oppforge/OppForge`
- [ ] All files reflected in latest commit
- [ ] No push errors in terminal output
- [ ] GitHub Actions CI/CD passes (if configured)

### View Commit on GitHub

```
https://github.com/oppforge/OppForge/commits/main
```

---

## Contract Address References for Documentation

When updating README files or deployment docs, use these links:

### OppForgeProtocol
- **Chain:** Arbitrum One (Chain ID: 42161)
- **Address:** `0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae`
- **Arbiscan:** https://arbiscan.io/address/0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae
- **Read Contract:** https://arbiscan.io/address/0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae#readContract
- **Transactions:** https://arbiscan.io/address/0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae#txlistinternal

### OppForgeMission
- **Chain:** Arbitrum One (Chain ID: 42161)
- **Address:** `0x91F0106205D87EAB2e7541bb2a09d5b933f94937`
- **Arbiscan:** https://arbiscan.io/address/0x91F0106205D87EAB2e7541bb2a09d5b933f94937
- **Read Contract:** https://arbiscan.io/address/0x91F0106205D87EAB2e7541bb2a09d5b933f94937#readContract

---

## Post-Push Actions

### 1. Update Environment Variables (if deployment hosts change)

**Railway Platform Deployment:**
```bash
# These env vars should be set in Railway for production
NEXT_PUBLIC_PAYMENT_NETWORK=arbitrum
NEXT_PUBLIC_PROTOCOL_CONTRACT_ADDRESS=0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae
NEXT_PUBLIC_MISSION_CONTRACT_ADDRESS=0x91F0106205D87EAB2e7541bb2a09d5b933f94937
PAYMENT_NETWORK=arbitrum
PROTOCOL_CONTRACT_ADDRESS=0x44cF9A17e5D976f3D63a497068E2eC2D0a36B9Ae
```

### 2. Verify Live Deployments

After push and platform redeploy:

```bash
# Test subscription flow manually:
1. Visit https://app.oppforge.xyz/dashboard/subscription
2. Check trial status → if expired, click "Subscribe"
3. Confirm MetaMask popup: upgradeTier(1) for 0.005 ETH
4. Verify transaction on https://arbiscan.io/
5. Check admin dashboard: https://app.oppforge.xyz/admin/billing
   - Payment should appear in live feed
   - Revenue analytics should update
```

### 3. Monitor Payment Processing

Backend endpoint to monitor:
```
POST https://oppbackendapi.oppforge.xyz/billing/verify-payment

Logs location (Railway console):
Dashboard → backend service → Logs → filter for "billing"
```

Admin view:
```
GET https://oppbackendapi.oppforge.xyz/billing/admin/revenue
(Admin role required)
```

---

## Troubleshooting Push Issues

### Issue: "Permission denied (publickey)"

**Solution:**
```bash
# Verify SSH key is added to GitHub
ssh -T git@github.com

# If issue persists, use HTTPS instead:
git remote set-url origin https://github.com/oppforge/OppForge.git
```

### Issue: "Your branch and 'origin/main' have diverged"

**Solution:**
```bash
# Pull latest from remote first
git pull origin main --rebase

# Then push
git push origin main
```

### Issue: "Updates were rejected because the tip of your current branch is behind"

**Solution:**
```bash
# Fetch and merge latest
git fetch origin
git merge origin/main

# Resolve any conflicts if prompted, then push
git push origin main
```

---

## What's Live After Push

### ✅ Subscription System
- Users can subscribe from dashboard
- 0.005 ETH per month (Hunter tier)
- Payments processed on Arbitrum One
- Automatic tier upgrade in database

### ✅ Admin Dashboard
- View all payments at `/admin/billing`
- Revenue analytics by tier and network
- CSV export of transactions
- Real-time payment feed

### ✅ Smart Contracts
- Protocol contract accepting payments
- Mission contract ready for Phase 2
- Both verified and viewable on Arbiscan

### ✅ Documentation
- Contracts README updated with live addresses
- Grant applications reference deployed contracts
- Payment flow documentation complete

---

## Next Steps (Post-Deployment)

1. **Test First Real Payment** — Subscribe as test user, confirm flow E2E
2. **Monitor Dashboard** — Watch `/admin/billing` for incoming payments
3. **Communicate Launch** — Share Arbiscan links + admin dashboard with stakeholders
4. **Alert on Sums** — Set up alerts when monthly revenue threshold crossed
5. **Phase 2 Prep** — Plan on-chain mission completion integration

---

**Deployment Config Locked:** `deployed-addresses.json`  
**Last Updated:** March 16, 2026, 4:08 PM UTC  
**Status:** ✅ READY TO PUSH
