# DevKlicks - Developer Productivity Tools

A comprehensive suite of developer tools built with React, TypeScript, and Supabase.

## Features

- **Image Resizer** - Resize and convert images with custom dimensions
- **Background Remover** - AI-powered background removal using Clipdrop
- **Color Picker** - Generate beautiful color palettes from colors, logos, or themes
- **Favicon Generator** - Create professional favicons in multiple sizes
- **QR Code Generator** - Generate QR codes with bulk processing capabilities
- **Content Generator** - Lorem ipsum text generation for placeholder content

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devklicks
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your actual values:
   - Supabase URL and Anon Key
   - PayPal Client ID and Environment
   - Clipdrop API Key (for background removal)

4. **Start development server**
   ```bash
   npm run dev
   ```

## Environment Variables

The application requires several environment variables to function properly:

### Frontend Variables (Safe to expose)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_PAYPAL_CLIENT_ID` - PayPal client ID for payments
- `VITE_PAYPAL_ENVIRONMENT` - PayPal environment (sandbox/production)

### Server-side Variables (Keep secure)
- `PAYPAL_CLIENT_SECRET` - PayPal client secret (used in Edge Functions)
- `PAYPAL_WEBHOOK_ID` - PayPal webhook ID for verification
- `CLIPDROP_API_KEY` - Clipdrop API key for background removal

## Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy Edge Functions to Supabase**
   - Set environment variables in Supabase dashboard
   - Deploy functions from `supabase/functions/` directory

3. **Deploy frontend**
   - Upload `dist` folder to your hosting provider
   - Ensure environment variables are properly configured

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Payments**: PayPal integration with webhook verification
- **AI Services**: Clipdrop API for background removal

## Security

- All sensitive API keys are handled server-side via Edge Functions
- Row Level Security (RLS) enabled on all database tables
- PayPal webhook verification for payment security
- Secure file upload and processing

## Support

For support, contact: support@devklicks.xyz