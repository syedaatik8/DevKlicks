// Environment variable validation and fallbacks
export const ENV = {
  // Supabase Configuration
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://xiajvswgehfohptzfgse.supabase.co',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpYWp2c3dnZWhmb2hwdHpmZ3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDc3ODUsImV4cCI6MjA2NjcyMzc4NX0.mTB3t2Aq-nnEEx485rtDckzmV60hRefoXdYW7jgZbeA',
  
  // PayPal Configuration
  PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AVMhEHMAwfiVACnAJ3tQIDsooLsK3npGe2B7CP6KO1hn-4MVSWoT4CIE-voLr1B5AV32NqIfP4KxBT8B',
  PAYPAL_ENVIRONMENT: import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'production',
  
  // Development mode check
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
}

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'PAYPAL_CLIENT_ID',
] as const

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(key => !ENV[key])
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing)
    console.warn('Using fallback values for development')
  }
  
  return missing.length === 0
}

// Initialize environment validation
validateEnvironment()