# Environment Variables Setup Guide

This guide will help you set up the required environment variables for DevKlicks.

## Quick Setup

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values (see sections below)

## Required Environment Variables

### 1. Supabase Configuration

Get these from your Supabase project dashboard:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**How to get these:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the URL and anon key

### 2. PayPal Configuration

For payment processing:

```env
VITE_PAYPAL_CLIENT_ID=your_client_id_here
VITE_PAYPAL_ENVIRONMENT=sandbox
```

**How to get these:**
1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create an app
3. Copy the Client ID
4. Use `sandbox` for testing, `production` for live

### 3. Server-side Configuration

These go in your Supabase Edge Functions environment:

```env
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_WEBHOOK_ID=your_webhook_id_here
CLIPDROP_API_KEY=your_clipdrop_key_here
```

**How to set these:**
1. Go to Supabase Dashboard → Edge Functions → Settings
2. Add each variable in the Environment Variables section

## Troubleshooting

### .env file keeps disappearing

If your `.env` file keeps getting deleted:

1. Make sure it's in the project root directory
2. Check that `.env` is in your `.gitignore` file
3. The app has fallback values, so it should work even without the file

### Environment variables not loading

1. Restart your development server after changing `.env`
2. Make sure variable names start with `VITE_` for frontend variables
3. Check the browser console for any error messages

### PayPal not working

1. Verify your Client ID is correct
2. Make sure environment is set to `sandbox` for testing
3. Check that webhook URL is configured in PayPal dashboard

### Background removal not working

1. Verify Clipdrop API key is set in Supabase Edge Functions
2. Check Edge Function logs for any errors
3. Make sure the remove-background function is deployed

## Security Notes

- Never commit `.env` files to version control
- Frontend variables (VITE_*) are exposed to users
- Server-side variables are only accessible in Edge Functions
- Always use environment-specific keys (sandbox vs production)

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Check Supabase Edge Function logs
3. Contact support: support@devklicks.xyz