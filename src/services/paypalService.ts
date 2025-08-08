import { supabase } from '../lib/supabase'
import { ENV } from '../lib/env'

export interface PayPalOrderData {
  userId: string
  amount: number
  includesLifetimeUpdates: boolean
  currency?: string
}

export interface PayPalPaymentResult {
  success: boolean
  orderId?: string
  error?: string
  transactionId?: string
}

class PayPalService {
  private clientId: string
  private environment: 'sandbox' | 'production'

  constructor() {
    this.clientId = ENV.PAYPAL_CLIENT_ID
    this.environment = ENV.PAYPAL_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
    
    if (!this.clientId) {
      console.warn('PayPal Client ID not configured. Please set VITE_PAYPAL_CLIENT_ID environment variable.')
    }
  }

  /**
   * Initialize PayPal SDK
   */
  async initializePayPal(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if PayPal SDK is already loaded
      if (window.paypal) {
        resolve(true)
        return
      }

      // Load PayPal SDK
      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=USD&intent=capture`
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.head.appendChild(script)
    })
  }

  /**
   * Create PayPal order
   */
  async createOrder(orderData: PayPalOrderData): Promise<string> {
    try {
      // Create purchase record in database
      const { data: purchase, error: purchaseError } = await supabase
        .from('user_purchases')
        .insert({
          user_id: orderData.userId,
          purchase_type: orderData.includesLifetimeUpdates ? 'complete_package' : 'base_features',
          amount_paid: orderData.amount,
          currency: orderData.currency || 'USD',
          payment_status: 'pending',
          payment_method: 'paypal',
          includes_lifetime_updates: orderData.includesLifetimeUpdates
        })
        .select()
        .single()

      if (purchaseError) throw purchaseError

      // Store purchase ID for later use
      sessionStorage.setItem('pending_purchase_id', purchase.id)

      return purchase.id
    } catch (error) {
      console.error('Error creating order:', error)
      throw new Error('Failed to create order')
    }
  }

  /**
   * Handle successful PayPal payment
   */
  async handlePaymentSuccess(orderId: string, paypalTransactionId: string): Promise<PayPalPaymentResult> {
    try {
      const purchaseId = sessionStorage.getItem('pending_purchase_id')
      if (!purchaseId) {
        throw new Error('No pending purchase found')
      }

      // Update purchase record with PayPal transaction ID
      const { error: updateError } = await supabase
        .from('user_purchases')
        .update({
          paypal_transaction_id: paypalTransactionId,
          payment_status: 'completed',
          activated_at: new Date().toISOString()
        })
        .eq('id', purchaseId)

      if (updateError) throw updateError

      // Get purchase details to activate premium access
      const { data: purchase, error: fetchError } = await supabase
        .from('user_purchases')
        .select('*')
        .eq('id', purchaseId)
        .single()

      if (fetchError) throw fetchError

      // Activate premium access
      const { error: activateError } = await supabase.rpc('activate_premium_access', {
        p_user_id: purchase.user_id,
        p_purchase_id: purchaseId,
        p_includes_lifetime_updates: purchase.includes_lifetime_updates
      })

      if (activateError) throw activateError

      // Create transaction record
      await supabase
        .from('payment_transactions')
        .insert({
          user_id: purchase.user_id,
          purchase_id: purchaseId,
          transaction_id: paypalTransactionId,
          payment_method: 'paypal',
          amount: purchase.amount_paid,
          currency: purchase.currency,
          status: 'completed'
        })

      // Clear pending purchase
      sessionStorage.removeItem('pending_purchase_id')

      return {
        success: true,
        orderId,
        transactionId: paypalTransactionId
      }
    } catch (error) {
      console.error('Error handling payment success:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      }
    }
  }

  /**
   * Handle PayPal payment error
   */
  async handlePaymentError(orderId: string, error: any): Promise<void> {
    try {
      const purchaseId = sessionStorage.getItem('pending_purchase_id')
      if (purchaseId) {
        // Update purchase status to failed
        await supabase
          .from('user_purchases')
          .update({
            payment_status: 'failed'
          })
          .eq('id', purchaseId)

        // Create failed transaction record
        await supabase
          .from('payment_transactions')
          .insert({
            user_id: orderId, // This should be user_id, but we'll need to get it from purchase
            purchase_id: purchaseId,
            transaction_id: orderId,
            payment_method: 'paypal',
            amount: 0,
            status: 'failed',
            gateway_response: error
          })
      }
    } catch (err) {
      console.error('Error handling payment error:', err)
    }
  }

  /**
   * Get PayPal button configuration
   */
  getButtonConfig(orderData: PayPalOrderData) {
    return {
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal',
        height: 50
      },
      createOrder: async () => {
        try {
          const orderId = await this.createOrder(orderData)
          return orderId
        } catch (error) {
          console.error('Error creating PayPal order:', error)
          throw error
        }
      },
      onApprove: async (data: any) => {
        try {
          const result = await this.handlePaymentSuccess(data.orderID, data.paymentID || data.orderID)
          return result
        } catch (error) {
          console.error('Error approving payment:', error)
          throw error
        }
      },
      onError: async (err: any) => {
        console.error('PayPal payment error:', err)
        await this.handlePaymentError('', err)
      },
      onCancel: (data: any) => {
        console.log('PayPal payment cancelled:', data)
        // Handle cancellation if needed
      }
    }
  }
}

// Extend Window interface for PayPal
declare global {
  interface Window {
    paypal?: any
  }
}

export const paypalService = new PayPalService()