# DevKlicks Deployment Guide

## 🔐 Security-First Deployment

This guide ensures your API keys remain secure when deploying to production.

## 📁 File Structure

```
├── .env.production          # Frontend-safe environment variables
├── .env.server             # Server-side secrets (DO NOT deploy to frontend)
├── supabase/functions/     # Edge Functions (handle sensitive operations)
│   ├── paypal-webhook/     # PayPal webhook handler
│   └── remove-background/  # Background removal with hidden API key
└── dist/                   # Production build (safe to deploy)
```

## 🚀 Deployment Steps

### 1. Build for Production
```bash
npm run build
```
This creates a `dist` folder with only frontend-safe environment variables.

### 2. Deploy Edge Functions to Supabase
The Edge Functions handle sensitive operations server-side:

**Set Environment Variables in Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to Edge Functions → Settings
3. Add these environment variables:
   - `PAYPAL_CLIENT_SECRET`: EI9z4pDGissLg3lR4r-nUFf31XfB7WUg9KjQhcrqCXdWgqUN95RFNQKaY6g7j9ERN1WZKXgZOvWmzlSK
   - `CLIPDROP_API_KEY`: 39cb41faee95c4bb51d527254b8c5792b51c75047fc8d36ad73028184c8cbee3675cd5aca583d121e85d27dcc0cccfc8
   - `PAYPAL_WEBHOOK_ID`: 9LU53924GA2624813

### 3. Deploy to Your Domain (devklicks.xyz)
1. Upload only the `dist` folder contents to your web server
2. Configure your domain to point to the `dist` folder
3. Ensure HTTPS is enabled (required for PayPal)

### 4. Configure PayPal Webhook
Set your webhook URL in PayPal dashboard to:
```
https://xiajvswgehfohptzfgse.supabase.co/functions/v1/paypal-webhook
```

## 🔒 Security Features

### ✅ What's Safe in Frontend:
- Supabase URL and Anon Key (designed to be public)
- PayPal Client ID (meant to be public)
- PayPal Environment setting

### 🚫 What's Hidden Server-Side:
- PayPal Client Secret (in Edge Functions)
- Clipdrop API Key (in Edge Functions)
- Webhook verification secrets

## 📋 PayPal Webhook Events (Optimized List)

You can reduce your webhook events to only these essential ones:

### Required Events:
- `PAYMENT.CAPTURE.COMPLETED` - Payment successful
- `PAYMENT.CAPTURE.DENIED` - Payment failed
- `PAYMENT.CAPTURE.DECLINED` - Payment declined
- `PAYMENT.CAPTURE.REFUNDED` - Payment refunded

### Optional but Recommended:
- `PAYMENT.CAPTURE.PENDING` - Payment pending
- `PAYMENT.ORDER.CREATED` - Order created
- `PAYMENT.ORDER.CANCELLED` - Order cancelled

You can remove all the billing subscription events since you're using one-time payments.

## 🧪 Testing

### Sandbox Testing:
1. Change `VITE_PAYPAL_ENVIRONMENT` to `sandbox`
2. Use PayPal sandbox credentials
3. Test the complete payment flow

### Production Testing:
1. Use small test amounts ($0.01)
2. Verify webhook delivery
3. Check premium activation

## 🔧 Troubleshooting

### If payments aren't working:
1. Check Supabase Edge Functions logs
2. Verify webhook URL is accessible
3. Confirm environment variables are set correctly
4. Check PayPal webhook delivery status

### If API keys are visible:
1. Ensure you're using `.env.production` for builds
2. Verify Edge Functions are handling sensitive operations
3. Check that server-side keys aren't in the frontend bundle

## 📞 Support

If you encounter issues:
1. Check Supabase Edge Functions logs
2. Verify PayPal webhook delivery in PayPal dashboard
3. Test API endpoints directly

The system is designed to be secure by default - sensitive operations happen server-side, and only safe configuration is exposed to the frontend.