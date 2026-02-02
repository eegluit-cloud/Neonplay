# 🚀 Pay247 Production Configuration

## ✅ Credentials Updated

Your Pay247 production credentials have been configured in the player-backend.

### Configuration Details

**API Settings:**
- **API Domain:** `https://gateway.pay247.io`
- **API Documentation:** https://docs.pay247.io
- **Environment:** `production`

**Merchant Credentials:**
- **Merchant ID:** `JRHMXWDLOA10326`
- **Secret Key:** `9653c6b5bd9132a3db5b1628d3a14f36`
- **Webhook Secret:** `9653c6b5bd9132a3db5b1628d3a14f36`

**Webhook URLs:**
- **Deposit Webhook:** `http://13.228.114.152:4000/api/payment/pay247/webhook/deposit`
- **Withdrawal Webhook:** `http://13.228.114.152:4000/api/payment/pay247/webhook/withdrawal`

---

## 🔧 Environment File Location

All Pay247 credentials are stored in:
```
/Users/ujjwalsharma/Desktop/neonplay/neonplay/player-backend/.env
```

Lines 79-87 contain the Pay247 configuration.

---

## 📋 Active Pay247 API Endpoints

All endpoints are now connected to **production Pay247 gateway**:

### Deposit Operations
- **Create Deposit:** `POST /api/payment/pay247/deposit/create`
- **Check Status:** `GET /api/payment/pay247/deposit/:orderId/status`
- **Webhook Handler:** `POST /api/payment/pay247/webhook/deposit`

### Withdrawal Operations
- **Create Withdrawal:** `POST /api/payment/pay247/withdrawal/create`
- **Check Status:** `GET /api/payment/pay247/withdrawal/:orderId/status`
- **Webhook Handler:** `POST /api/payment/pay247/webhook/withdrawal`

---

## 🎯 Testing Pay247 (Production)

### 1. Frontend Testing

**Access the application:**
```
http://localhost:8000
```

**Test Deposit Flow:**
1. Click wallet icon (top right)
2. Select **Deposit** tab
3. Enter amount (e.g., 50)
4. Click **Continue**
5. Select **Pay247** (first option with "Recommended" badge)
6. Select currency: **USDT**, **INR**, or **PHP**
7. Select payment method based on currency
8. Click **"Deposit $XX via Pay247"**

**Expected Result:**
- Real Pay247 payment page opens in new tab
- Real transaction is created in Pay247 system
- Payment can be completed with actual payment details

### 2. Backend Testing

**Check backend logs:**
```bash
cd /Users/ujjwalsharma/Desktop/neonplay/neonplay
docker-compose logs -f player-backend
```

**Test API directly:**
```bash
# Create test deposit
curl -X POST http://localhost:4000/api/payment/pay247/deposit/create \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "amount": 50,
    "currency": "USDT",
    "paymentMethod": "TRC20"
  }'
```

---

## ⚠️ Important Production Notes

### 1. Webhook Configuration

**You must configure these webhook URLs in your Pay247 merchant dashboard:**

**Deposit Webhook:**
```
http://13.228.114.152:4000/api/payment/pay247/webhook/deposit
```

**Withdrawal Webhook:**
```
http://13.228.114.152:4000/api/payment/pay247/webhook/withdrawal
```

**Steps to configure in Pay247 dashboard:**
1. Login to https://merchant.pay247.io (or your merchant portal)
2. Navigate to Settings > Webhooks
3. Add both webhook URLs
4. Save configuration

### 2. Server IP Whitelisting

If Pay247 requires IP whitelisting for webhooks, add your server IP:
```
13.228.114.152
```

### 3. HTTPS for Production

**Current Setup:** Using HTTP (for development)

**For Production Deployment:**
- Set up SSL certificate for your domain
- Update webhook URLs to use HTTPS
- Example: `https://yourdomain.com/api/payment/pay247/webhook/deposit`

### 4. Supported Currencies & Methods

**USDT (Tether):**
- TRC20 (Tron)
- ERC20 (Ethereum)
- BEP20 (Binance Smart Chain)

**INR (Indian Rupee):**
- UPI
- Bank Transfer
- IMPS
- NEFT/RTGS

**PHP (Philippine Peso):**
- GCash
- Maya (PayMaya)
- Bank Transfer

---

## 🔐 Security Considerations

### 1. Environment Variables
- ✅ Credentials stored in .env file (not committed to git)
- ✅ Webhook secret matches merchant secret key
- ⚠️ Make sure .env is in .gitignore

### 2. Webhook Verification
- ✅ All webhooks verify Pay247 signature
- ✅ Idempotency protection implemented
- ✅ Webhook logs stored in database

### 3. Transaction Security
- ✅ All amounts validated before processing
- ✅ User authentication required for transactions
- ✅ Duplicate prevention via merchant order IDs

---

## 📊 Monitoring & Logs

### Database Tables

**Pay247 transactions stored in:**
- `deposits` - Deposit records with Pay247 fields
- `withdrawals` - Withdrawal records with Pay247 fields
- `pay247_webhook_logs` - All webhook events
- `user_payment_stats` - User payment statistics
- `daily_payment_stats` - Daily aggregated stats

### Webhook Logs

**Check webhook activity:**
```sql
SELECT * FROM pay247_webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

**Check recent deposits:**
```sql
SELECT id, user_id, amount, currency, status, merchant_order_id, pay247_order_id
FROM deposits
WHERE payment_provider = 'pay247'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🆘 Troubleshooting

### Issue: "Payment failed" in frontend
**Check:**
1. Backend logs for error details
2. Pay247 API credentials are correct
3. Network connectivity to Pay247 gateway

**Command:**
```bash
docker-compose logs player-backend | grep -i "pay247\|error"
```

### Issue: Webhook not received
**Check:**
1. Webhook URL configured in Pay247 dashboard
2. Server is accessible from Pay247's servers
3. Firewall allows incoming connections on port 4000

**Test webhook locally:**
```bash
curl -X POST http://13.228.114.152:4000/api/payment/pay247/webhook/deposit \\
  -H "Content-Type: application/json" \\
  -d '{"test": "webhook"}'
```

### Issue: Signature verification failed
**Check:**
1. PAY247_WEBHOOK_SECRET matches merchant secret key
2. Backend was restarted after .env changes

**Restart backend:**
```bash
docker-compose restart player-backend
```

---

## 📚 Additional Resources

- **Pay247 API Documentation:** https://docs.pay247.io
- **Pay247 Merchant Dashboard:** https://merchant.pay247.io (verify actual URL)
- **Support Email:** support@pay247.io (verify actual email)

---

## ✅ Current Status

- ✅ Production credentials configured
- ✅ Backend running with Pay247 integration
- ✅ Frontend WalletModal integrated
- ✅ All API endpoints active
- ✅ Shared database schema synced
- ✅ Webhook handlers ready

**Ready for production testing!** 🎉

---

**Last Updated:** 2026-02-01
**Configuration File:** `player-backend/.env`
**Environment:** Production
