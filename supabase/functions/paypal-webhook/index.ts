import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.text()
    const headers = Object.fromEntries(req.headers.entries())
    
    // Verify PayPal webhook signature (optional but recommended)
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')
    
    // Parse the webhook payload
    const event = JSON.parse(body)
    
    console.log('PayPal Webhook Event:', event.event_type)
    
    // Handle different event types
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(supabaseClient, event)
        break
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
        await handlePaymentFailed(supabaseClient, event)
        break
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePaymentRefunded(supabaseClient, event)
        break
      default:
        console.log('Unhandled event type:', event.event_type)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function handlePaymentCompleted(supabase: any, event: any) {
  const paymentId = event.resource.id
  const amount = parseFloat(event.resource.amount.value)
  
  // Find the purchase record by PayPal transaction ID
  const { data: purchase, error } = await supabase
    .from('user_purchases')
    .select('*')
    .eq('paypal_transaction_id', paymentId)
    .single()

  if (error || !purchase) {
    console.error('Purchase not found:', paymentId)
    return
  }

  // Activate premium access
  await supabase.rpc('activate_premium_access', {
    p_user_id: purchase.user_id,
    p_purchase_id: purchase.id,
    p_includes_lifetime_updates: purchase.includes_lifetime_updates
  })

  // Update transaction status
  await supabase
    .from('payment_transactions')
    .update({ status: 'completed' })
    .eq('transaction_id', paymentId)

  console.log('Premium access activated for user:', purchase.user_id)
}

async function handlePaymentFailed(supabase: any, event: any) {
  const paymentId = event.resource.id
  
  // Update purchase and transaction status
  await supabase
    .from('user_purchases')
    .update({ payment_status: 'failed' })
    .eq('paypal_transaction_id', paymentId)

  await supabase
    .from('payment_transactions')
    .update({ status: 'failed' })
    .eq('transaction_id', paymentId)

  console.log('Payment failed for transaction:', paymentId)
}

async function handlePaymentRefunded(supabase: any, event: any) {
  const paymentId = event.resource.id
  
  // Update purchase status and revoke premium access
  const { data: purchase } = await supabase
    .from('user_purchases')
    .update({ payment_status: 'refunded' })
    .eq('paypal_transaction_id', paymentId)
    .select()
    .single()

  if (purchase) {
    // Revoke premium access
    await supabase
      .from('user_profiles')
      .update({ 
        has_premium_access: false,
        has_lifetime_updates: false,
        subscription_tier: 'free'
      })
      .eq('id', purchase.user_id)
  }

  console.log('Payment refunded and access revoked for transaction:', paymentId)
}