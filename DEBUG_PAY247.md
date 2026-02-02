# 🔍 Pay247 API Debugging Guide

## Issue: Deposit Create API Not Being Hit

### Step 1: Verify You're Logged In

**Check if you have a valid session:**

1. Open browser **DevTools** (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Check **Cookies** for `http://localhost:8000`
4. Look for: `access_token` or `refresh_token` cookies

**If no cookies found:**
- You're **NOT logged in**
- The 401 error is expected
- **Solution:** Login first!

---

### Step 2: Check Browser Console for Errors

1. Open **Console** tab in DevTools (F12)
2. Look for **red errors**
3. Check for:
   - "Network error"
   - "CORS error"
   - "Unauthorized"
   - Any JavaScript errors

**Common errors and fixes:**

| Error | Fix |
|-------|-----|
| "Network request failed" | Backend not running - check `docker-compose ps` |
| "401 Unauthorized" | Not logged in - login first |
| "CORS error" | Backend CORS config issue |
| "Cannot read property..." | Frontend code error |

---

### Step 3: Test Backend Directly (Bypass Frontend)

**Test if backend is working:**

```bash
# 1. First, login to get a token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Copy the `accessToken` from the response, then:**

```bash
# 2. Test Pay247 deposit endpoint
curl -X POST http://localhost:4000/api/payment/pay247/deposit/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "amount": 50,
    "currency": "USDT",
    "paymentMethod": "TRC20"
  }'
```

**Expected response:**
```json
{
  "depositId": "uuid-here",
  "paymentUrl": "https://gateway.pay247.io/...",
  "merchantOrderId": "PAY247_DEP_...",
  "pay247OrderId": "P247ORD..."
}
```

**If this works:** Backend is fine, issue is in frontend/browser cache.
**If this fails:** Backend issue - check logs.

---

### Step 4: Check Backend Logs

```bash
cd /Users/ujjwalsharma/Desktop/neonplay/neonplay

# Watch backend logs in real-time
docker-compose logs -f player-backend

# Or check recent errors
docker-compose logs player-backend | grep -i "error\|pay247" | tail -20
```

**Look for:**
- ✅ `POST /api/payment/pay247/deposit/create 201` (success)
- ❌ `POST /api/payment/pay247/deposit/create 401` (auth error)
- ❌ `POST /api/payment/pay247/deposit/create 500` (server error)

---

### Step 5: Verify Frontend Network Request

1. **Open DevTools** → **Network** tab
2. **Clear** all requests (trash icon)
3. **Try the deposit** again
4. **Look for** the request to `/payment/pay247/deposit/create`

**Check:**
- ✅ Request URL: Should be `http://localhost:4000/api/payment/...` (NO `/v1/`)
- ✅ Request Headers: Should include `Authorization: Bearer ...`
- ✅ Request Payload: Should have `amount`, `currency`, `paymentMethod`

**If you see `/api/v1/` in the URL:**
- Browser cache not cleared
- **Solution:** Force clear cache or use incognito mode

---

## 🚀 Quick Fix Checklist

### Option A: Clear Browser Cache (Recommended)

**Chrome/Edge:**
1. F12 → Application → Clear storage → Clear site data
2. Or: Ctrl+Shift+Delete → Cached images/files → Clear

**Firefox:**
1. F12 → Storage → Clear All
2. Or: Ctrl+Shift+Delete → Cache → Clear

**Safari:**
1. Cmd+Option+E (Empty Caches)
2. Reload

### Option B: Use Incognito/Private Mode

1. Open **Incognito** window (Ctrl+Shift+N / Cmd+Shift+N)
2. Go to `http://localhost:8000`
3. Login and test Pay247
4. This bypasses all cache

### Option C: Different Browser

Try a completely different browser:
- Chrome → Try Firefox
- Firefox → Try Chrome
- Any → Try Edge

---

## 🔧 Common Issues & Solutions

### 1. Still seeing /api/v1/ in URL

**Cause:** Browser using cached JavaScript

**Solutions:**
1. Clear cache completely
2. Use incognito mode
3. Disable cache in DevTools:
   - F12 → Network tab
   - Check "Disable cache"
   - Keep DevTools open

### 2. "401 Unauthorized" Error

**Cause:** Not logged in or token expired

**Solution:**
1. Logout (if needed)
2. Login again: `test@example.com` / `Test123!`
3. Try deposit immediately (token expires in 15 minutes)

### 3. "Network request failed"

**Cause:** Backend not running or wrong URL

**Solutions:**
1. Check backend status: `docker-compose ps`
2. Restart backend: `docker-compose restart player-backend`
3. Check URL in Network tab

### 4. Request doesn't show in Network tab

**Cause:** JavaScript error preventing the API call

**Solution:**
1. Check Console tab for errors
2. Look for red error messages
3. Share the error message

---

## 📝 Manual Test Steps

Follow these EXACT steps:

1. **Close all browser tabs** with localhost:8000
2. **Clear browser cache** completely
3. **Open NEW incognito window**
4. **Go to:** `http://localhost:8000`
5. **Open DevTools** (F12) → Network tab
6. **Login:**
   - Email: `test@example.com`
   - Password: `Test123!`
7. **Click wallet icon** (top right)
8. **Select Deposit tab**
9. **Enter amount:** 50
10. **Click Continue**
11. **Select Pay247**
12. **Watch Network tab** for the API call

**What to check:**
- ✅ URL should be `/api/payment/...` (NOT `/api/v1/`)
- ✅ Status should be 201 or 200 (NOT 401)
- ✅ Response should have `paymentUrl`

---

## 🆘 Still Not Working?

If none of the above works, please share:

1. **Screenshot of Network tab** showing the failed request
2. **Browser console errors** (Console tab)
3. **Backend logs:**
   ```bash
   docker-compose logs player-backend | tail -50
   ```

4. **Frontend logs:**
   ```bash
   docker-compose logs player-frontend | tail -30
   ```

This will help identify the exact issue!
