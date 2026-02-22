# ⚒️ OppForge Admin & Testing Guide

This document outlines the available commands for managing and testing the OppForge infrastructure.

## 🛡️ Administrative Commands (Backend)

All administrative actions are handled by the `admin.py` CLI tool located in the `backend/` directory.

### **Key Administrative Action: Promote to Admin**
This is the most critical command for establishing control. It grants a user full access to the Admin Dashboard and bypasses subscription checks.

```bash
python admin.py promote <user_email>
```

### **Full User Management Commands**
Manage users, roles, and search findings.

| Command | Description | Example |
|---------|-------------|---------|
| `promote` | **Grant ADMIN privileges** | `python admin.py promote pilot@forge.xyz` |
| `users` | List all registered users | `python admin.py users` |
| `add-user` | Create a user manually | `python admin.py add-user pilot@forge.xyz skyhunter` |
| `search-user` | Search by email or username | `python admin.py search-user pilot@` |
| `delete-user` | Permanent account removal | `python admin.py delete-user pilot@forge.xyz` |

### **Opportunity Management**
Handle manual mission control and verification.

| Command | Description | Example |
|---------|-------------|---------|
| `opps` | List recent opportunities | `python admin.py opps` |
| `create-opp` | Manually add a mission | `python admin.py create-opp "New Grant" "https://..." --chain Solana` |
| `verify` | Approve a mission | `python admin.py verify <UUID>` |
| `delete-opp` | Remove a mission | `python admin.py delete-opp <UUID>` |

---

## 🧪 Testing & Health Commands

Testing is split into specific service level tests and a unified master suite.

### **1. Master Test Suite**
The recommended way to verify the entire stack.
```bash
python tools/master_test.py
```

### **2. Backend API Tests**
Verifies endpoint availability and JSON response integrity.
```bash
cd backend
python test_api.py
```

### **3. AI Engine Tests**
Verifies the Llama3/Mistral pipeline and scoring internal logic.
```bash
cd ai-engine
python test_engine.py
```

---

## 🚀 Deployment Verification
To check a live deployment (e.g., Railway/Vercel), pass the URL to the test scripts:
```bash
python backend/test_api.py https://api.oppforge.xyz
```
