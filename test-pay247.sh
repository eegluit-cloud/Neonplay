#!/bin/bash

# Test Pay247 API - Quick Debug Script

echo "🧪 Testing Pay247 API..."
echo "========================"
echo ""

# Test 1: Login to get token
echo "1️⃣  Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed - no access token received"
  echo "Check if backend is running: docker-compose ps"
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# Test 2: Test Pay247 deposit endpoint
echo "2️⃣  Testing Pay247 deposit..."
DEPOSIT_RESPONSE=$(curl -s -X POST http://localhost:4000/api/payment/pay247/deposit/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "amount": 50,
    "currency": "USDT",
    "paymentMethod": "TRC20"
  }')

echo "Deposit Response:"
echo "$DEPOSIT_RESPONSE" | jq '.' 2>/dev/null || echo "$DEPOSIT_RESPONSE"
echo ""

# Check if successful
if echo "$DEPOSIT_RESPONSE" | grep -q "paymentUrl"; then
  echo "✅ Pay247 API is working correctly!"
  echo ""
  PAYMENT_URL=$(echo "$DEPOSIT_RESPONSE" | grep -o '"paymentUrl":"[^"]*' | cut -d'"' -f4)
  echo "Payment URL: $PAYMENT_URL"
else
  echo "❌ Pay247 API call failed"
  echo "Check backend logs: docker-compose logs player-backend | tail -50"
fi

echo ""
echo "========================"
echo "Test complete!"
