# 🔴 Phân Tích Lỗi "Backend Phản Hồi Quá Lâu"

**Ngày:** 31/05/2026  
**Lỗi:** "Backend phản hồi quá lâu. Vui lòng thử lại sau."  
**Mức độ:** 🔴 CRITICAL - Website không hoạt động

---

## 🎯 NGUYÊN NHÂN CHÍNH

### 1️⃣ Production URL Sai (Most Likely)

**Vấn đề:**
- `.env.local` cấu hình: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1`
- Trong production trên **Vercel**, localhost:8080 **không tồn tại**
- Request timeout sau 15 giây

**Kết quả:**
- Frontend trên Vercel → gửi request tới `http://localhost:8080/...`
- Vercel server không có backend running locally
- Request hang → timeout sau 15s
- Lỗi: "Backend phản hồi quá lâu"

**Chứng cứ:**
```javascript
// lib/api/client.ts dòng 30-31
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"
```

- `.env.local` chỉ cho development
- Vercel **không sử dụng** `.env.local` trong production
- Fallback là `localhost:8080` → không tồn tại trên Vercel

---

### 2️⃣ Backend Server Down (Render Free Tier)

**Vercel Configuration:**
```
Website: https://giase-web-gv6y.vercel.app
API Base URL: ??? (không cấu hình)
```

**Nên là:**
```
Website: https://giase-web-gv6y.vercel.app
API Base URL: https://web-giasu-be-4.onrender.com/api/v1
```

**Vấn đề Render:**
- Render.com Free Tier tự sleep sau 15 phút idle
- First request wake-up: **+50 giây delay**
- API_TIMEOUT_MS = 15 giây → **timeout trước khi backend wake up**

**Timeline:**
```
User click "Tìm gia sư" 
  ↓ (0s)
Frontend request → https://localhost:8080/tutors
  ↓ (0-15s)
No response (Vercel không có backend)
  ↓ (15s)
Request abort → Timeout
  ↓ (15s)
Show error: "Backend phản hồi quá lâu"
```

---

## 🔧 CÁCH SỬA

### Fix 1: Set Environment Variables trong Vercel

**Trên Vercel Dashboard:**

1. Go to: **Settings → Environment Variables**
2. Add:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://web-giasu-be-4.onrender.com/api/v1
   ```
3. Redeploy → force rebuild

**Result:**
- Development: `.env.local` → `http://localhost:8080/api/v1`
- Production: Vercel env var → `https://web-giasu-be-4.onrender.com/api/v1`

---

### Fix 2: Upgrade Render Backend

**Current Issue:**
- Render.com Free Tier → Auto-sleep
- First request wake-up: 50 seconds
- API_TIMEOUT_MS: 15 seconds → **Timeout!**

**Solution:**
1. Go to **Render Dashboard**
2. Select project: **web-giasu-be-4**
3. Upgrade to **Paid Plan ($7/month minimum)**
4. Enable "Always On" → No more sleep

**Result:**
- Backend always awake
- Response time: <500ms
- No timeout on first request

---

### Fix 3: Increase Timeout (Temporary)

**In `.env.local` (Development):**
```env
NEXT_PUBLIC_API_TIMEOUT_MS=30000  # 30 seconds instead of 15
```

**In Vercel (Production):**
Add env variable:
```
NEXT_PUBLIC_API_TIMEOUT_MS=30000
```

**Why not permanent:**
- 30s timeout still bad UX
- Better to upgrade Render to "Always On"

---

### Fix 4: Add API Status Check (Optional)

**Create `lib/api/health-check.ts`:**

```typescript
export async function checkApiHealth() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/health`,
      { signal: AbortSignal.timeout(5000) }
    )
    return response.ok
  } catch {
    return false
  }
}
```

**Use in component:**
```typescript
const isApiHealthy = await checkApiHealth()
if (!isApiHealthy) {
  showError("Backend server is down. Trying to wake it up...")
  // Auto-retry after 60s
}
```

---

## 📋 SUMMARY TABLE

| Nguyên nhân | Xác suất | Timeline Fix | Độ ưu tiên |
|-------------|---------|-------------|-----------|
| **Vercel env var sai** | 🔴 Very High | 10 min | 🔴 P0 |
| **Render free tier sleep** | 🔴 Very High | 5 min setup | 🔴 P0 |
| **Timeout quá ngắn** | 🟡 Medium | 5 min | 🟡 P1 |
| **Network issue** | 🟡 Low | Varies | 🟡 P2 |
| **Backend code bug** | ⚪ Low | TBD | ⚪ P3 |

---

## ✅ CHECKLIST FIX

### Immediate (10 minutes)
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` in Vercel Settings
- [ ] Set `NEXT_PUBLIC_API_TIMEOUT_MS=30000` in Vercel Settings
- [ ] Redeploy website

### Short term (5 minutes)
- [ ] Upgrade Render backend to Paid Plan
- [ ] Enable "Always On" feature
- [ ] Verify API responds in <1 second

### Medium term (1 hour)
- [ ] Test full workflow: Register → Login → Search Tutor
- [ ] Monitor error logs
- [ ] Add health check endpoint
- [ ] Create monitoring dashboard

### Long term (1 day)
- [ ] Create `.env.production` (local setup)
- [ ] Document production deployment steps
- [ ] Add CI/CD pipeline checks
- [ ] Setup alerting for API down

---

## 🚀 QUICK FIX STEPS

### Step 1: Fix Vercel Environment (5 min)

```bash
# Or use Vercel Dashboard:
# Settings → Environment Variables → Add
NEXT_PUBLIC_API_BASE_URL=https://web-giasu-be-4.onrender.com/api/v1
NEXT_PUBLIC_API_TIMEOUT_MS=30000
```

### Step 2: Redeploy (2 min)

```bash
# Or use Vercel Dashboard → Redeploy
git push origin main  # Auto-deploys on Vercel
```

### Step 3: Verify (1 min)

```bash
# Open website
# https://giase-web-gv6y.vercel.app

# Check API call in browser console
# Should see requests to https://web-giasu-be-4.onrender.com/...
```

### Step 4: Upgrade Render (3 min)

1. Go to: https://render.com/dashboard
2. Find project: **web-giasu-be-4**
3. Click: **Settings → Pricing Plan → Upgrade to Paid**
4. Select: **Standard Plan ($7/month)**
5. Enable: **Always On**

---

## 🧪 VERIFICATION

After applying fixes:

```javascript
// In browser console on https://giase-web-gv6y.vercel.app

// Check API Base URL
fetch('/api/v1/health').catch(() => {
  console.log('API endpoint incorrect')
})

// Should see:
// 1. Request to https://web-giasu-be-4.onrender.com/api/v1/health
// 2. Response: { success: true } or similar
// 3. Response time: <1000ms
```

---

## 📊 EXPECTED RESULTS

### Before Fix
```
User: "Tìm gia sư"
↓
Frontend: Timeout after 15s
↓
Error: "Backend phản hồi quá lâu"
↓
Response time: 15,000ms (TIMEOUT)
```

### After Fix
```
User: "Tìm gia sư"
↓
Frontend: Request to https://web-giasu-be-4.onrender.com/api/v1/tutors
↓
Backend: Response in 200-500ms
↓
Success: Tutor list loads
↓
Response time: 200-500ms (OK)
```

---

## ⚠️ IF STILL NOT WORKING

**Troubleshooting:**

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Still timeout | Render backend still down | Check Render logs / Upgrade to paid plan |
| Network error | Wrong URL | Verify NEXT_PUBLIC_API_BASE_URL |
| 500 errors | Backend bug | Check backend logs |
| CORS error | Backend CORS config | Check backend allowed origins |
| Empty data | API working but no data | Seed demo data in backend |

**Check Backend Logs:**
```bash
# SSH into Render
# Or view logs in Render Dashboard

# Check if server started
curl https://web-giasu-be-4.onrender.com/api/v1/health

# Should return:
# {"success":true}
```

---

## 🎓 LESSONS LEARNED

1. **Never hardcode localhost in frontend** 
   - Use environment variables
   - Different URLs for dev/prod

2. **Use managed services properly**
   - Free tier has limitations (sleep, no uptime guarantee)
   - Prod use paid tier

3. **Monitor API availability**
   - Add health checks
   - Alert when down
   - Auto-retry with backoff

4. **Document deployment**
   - Environment variables needed
   - Required service URLs
   - Setup checklist

5. **Test end-to-end**
   - Don't just test locally
   - Test on production deployment
   - Verify before launching

---

**Status:** 🔴 URGENT - Website is down  
**Time to fix:** 10-15 minutes  
**Resources needed:** Access to Vercel + Render dashboards  

