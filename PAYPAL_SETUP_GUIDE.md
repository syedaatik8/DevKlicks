# PayPal Integration Setup Guide

This guide will help you set up PayPal payments for DevKlicks with the new one-time payment structure.

## 1. PayPal Developer Account Setup

### Step 1: Create PayPal Developer Account
1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Sign in with your PayPal account or create a new one
3. Navigate to "My Apps & Credentials"

### Step 2: Create a New App
1. Click "Create App"
2. Choose "Default Application" 
3. Select "Merchant" as the account type
4. Choose your business account (or create sandbox account for testing)
5. Select the following features:
   - **Accept payments** ✅
   - **Log in with PayPal** (optional)

### Step 3: Get Your Credentials
After creating the app, you'll get:
- **Client ID** (for frontend)
- **Client Secret** (for backend - keep secure)

## 2. Environment Variables Setup

Add these to your `.env` file:

```env
# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=your_client_id_here
VITE_PAYPAL_ENVIRONMENT=sandbox
```

For production, change `VITE_PAYPAL_ENVIRONMENT` to `production`.

## 3. Required PayPal API Credentials

### For Development (Sandbox):
- **Client ID**: Found in your PayPal app dashboard
- **Client Secret**: Found in your PayPal app dashboard (keep secure)
- **Environment**: `sandbox`

### For Production:
- **Client ID**: Production client ID from your live PayPal app
- **Client Secret**: Production client secret (keep secure)
- **Environment**: `production`

## 4. PayPal App Configuration

### Required Settings in PayPal Dashboard:
1. **Return URL**: `https://yourdomain.com/payment/success`
2. **Cancel URL**: `https://yourdomain.com/payment/cancel`
3. **Webhook URL**: `https://yourdomain.com/api/paypal/webhook` (for payment notifications)

### Features to Enable:
- ✅ **Accept payments**
- ✅ **Checkout experience** 
- ✅ **Reference transactions** (for future features)
- ✅ **Webhooks** (for payment verification)

## 5. Webhook Setup (Recommended)

### Step 1: Create Webhook Endpoint
1. In PayPal Dashboard, go to "Webhooks"
2. Click "Create webhook"
3. Set webhook URL: `https://yourdomain.com/api/paypal/webhook`

### Step 2: Select Events
Enable these webhook events:
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`

### Step 3: Get Webhook ID
Save the Webhook ID for verification.

## 6. Testing

### Sandbox Testing:
1. Use sandbox credentials
2. Test with PayPal sandbox accounts
3. Use test credit card numbers provided by PayPal

### Test Payment Flow:
1. User clicks "Purchase" 
2. PayPal popup opens
3. User completes payment
4. Payment success triggers premium activation
5. User gets immediate access to premium features

## 7. Security Considerations

### Client-Side Security:
- ✅ Client ID is safe to expose (it's meant to be public)
- ✅ All sensitive operations happen server-side
- ✅ Payment verification through webhooks

### Server-Side Security:
- 🔒 Keep Client Secret secure (never expose to frontend)
- 🔒 Verify all payments server-side
- 🔒 Use webhooks for payment confirmation
- 🔒 Implement proper error handling

## 8. Payment Flow

```
1. User selects plan ($69 base + optional $40 lifetime updates)
2. PayPal button renders with correct amount
3. User clicks PayPal button
4. PayPal popup opens for payment
5. User completes payment
6. PayPal returns success/failure
7. Our system verifies payment
8. Premium access activated immediately
9. User gets confirmation
```

## 9. Required Information from You

To complete the PayPal integration, I need:

### Essential:
1. **PayPal Client ID** (sandbox for testing)
2. **PayPal Client Secret** (for webhook verification)
3. **Your business PayPal email**

### Optional but Recommended:
4. **Webhook endpoint URL** (we can set this up)
5. **Business information** for PayPal app verification
6. **Production credentials** when ready to go live

## 10. Next Steps

1. **Create PayPal Developer Account**
2. **Create App and get credentials**
3. **Add credentials to environment variables**
4. **Test in sandbox mode**
5. **Set up webhooks for production**
6. **Switch to production when ready**

## 11. Pricing Structure Implementation

The system now supports:
- **Base Package**: $69 (all current features)
- **Lifetime Updates Add-on**: +$40 (future features forever)
- **Total Options**: $69 or $109 (base + lifetime updates)

## 12. Database Schema

The payment system includes:
- `user_purchases` - Track all purchases
- `payment_transactions` - Detailed transaction logs
- `user_profiles` - Updated with premium status
- Functions for activating premium access

## Support

If you need help with any step, please provide:
1. Your PayPal Developer account email
2. Any error messages you encounter
3. Screenshots of your PayPal app configuration

The integration is designed to be secure, user-friendly, and fully automated once configured.