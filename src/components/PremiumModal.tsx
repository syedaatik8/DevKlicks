import React, { useState, useEffect, useRef } from 'react'
import { X, Crown, Check, Zap, Star, Users, Infinity, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { paypalService } from '../services/paypalService'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshPurchaseInfo } = useAuth()
  const [includeLifetimeUpdates, setIncludeLifetimeUpdates] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paypalLoaded, setPaypalLoaded] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const paypalRef = useRef<HTMLDivElement>(null)

  const basePrice = 69
  const lifetimeUpdatesPrice = 40
  const totalPrice = basePrice + (includeLifetimeUpdates ? lifetimeUpdatesPrice : 0)

  // Initialize PayPal when modal opens
  useEffect(() => {
    if (isOpen && !paypalLoaded) {
      initializePayPal()
    }
  }, [isOpen, paypalLoaded])

  // Re-render PayPal buttons when price changes
  useEffect(() => {
    if (paypalLoaded && paypalRef.current && user) {
      renderPayPalButtons()
    }
  }, [includeLifetimeUpdates, paypalLoaded, user])

  if (!isOpen) return null

  const initializePayPal = async () => {
    try {
      const loaded = await paypalService.initializePayPal()
      if (loaded) {
        setPaypalLoaded(true)
      } else {
        setError('Failed to load PayPal. Please refresh and try again.')
      }
    } catch (err) {
      setError('Failed to initialize payment system.')
    }
  }

  const renderPayPalButtons = () => {
    if (!paypalRef.current || !user || !window.paypal) return

    // Clear existing buttons
    paypalRef.current.innerHTML = ''

    const orderData = {
      userId: user.id,
      amount: totalPrice,
      includeLifetimeUpdates,
      currency: 'USD'
    }

    const config = paypalService.getButtonConfig(orderData)

    window.paypal.Buttons({
      ...config,
      onApprove: async (data: any) => {
        setIsProcessing(true)
        try {
          const result = await config.onApprove(data)
          if (result.success) {
            setSuccess('Payment successful! Your premium access has been activated.')
            await refreshPurchaseInfo()
            setTimeout(() => {
              onClose()
            }, 2000)
          } else {
            setError(result.error || 'Payment processing failed')
          }
        } catch (err) {
          setError('Payment processing failed. Please try again.')
        } finally {
          setIsProcessing(false)
        }
      },
      onError: (err: any) => {
        setError('Payment failed. Please try again.')
        setIsProcessing(false)
      }
    }).render(paypalRef.current)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-8 z-[9996] overflow-hidden">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Header */}
        <div className="flex items-center justify-between p-10 border-b border-gray-700/50">
          <div>
            <h2 className="text-4xl font-bold text-white mb-3">Unlock DevKlicks Premium</h2>
            <p className="text-gray-400 text-lg">Get lifetime access to all current developer tools</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-10">
          {/* Single Plan Card */}
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-2 border-purple-500/50 rounded-2xl p-8 mb-8">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium px-6 py-2 rounded-full">
                  One-Time Payment
                </span>
              </div>

              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">DevKlicks Premium</h3>
                <div className="text-6xl font-bold text-white mb-4">
                  ${totalPrice}
                  <span className="text-xl text-gray-400 font-normal ml-2">one-time</span>
                </div>
                <p className="text-gray-400">
                  Lifetime access to all current features
                </p>
              </div>

              {/* Base Features */}
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Check className="w-5 h-5 text-green-400 mr-2" />
                  Included Features ($69)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'Unlimited Image Resizing',
                    'AI Background Removal',
                    'Advanced Color Picker',
                    'Favicon Generator',
                    'QR Code Generator (All formats)',
                    'Content Generator',
                    'Bulk Processing',
                    'High-Quality Exports',
                    'Priority Support',
                    'No Watermarks'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifetime Updates Add-on */}
              <div className="border-t border-gray-600/50 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="lifetime-updates"
                      checked={includeLifetimeUpdates}
                      onChange={(e) => setIncludeLifetimeUpdates(e.target.checked)}
                      className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="lifetime-updates" className="ml-3 cursor-pointer">
                      <div className="flex items-center">
                        <Infinity className="w-5 h-5 text-purple-400 mr-2" />
                        <span className="text-lg font-semibold text-white">Lifetime Updates</span>
                        <span className="ml-2 bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                          +$40
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="ml-8 mb-4">
                  <p className="text-gray-400 text-sm mb-3">
                    Get access to all future features and updates forever
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'All future tool releases',
                      'Feature enhancements',
                      'New export formats',
                      'Advanced integrations',
                      'API access (when available)',
                      'Beta feature access'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-400">
                        <Shield className="w-3 h-3 text-purple-400 mr-2 flex-shrink-0" />
                        <span className="text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-6">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-6">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              {/* PayPal Button Container */}
              <div className="mt-6">
                <div className="text-center mb-4">
                  <p className="text-white font-semibold text-lg">
                    Complete Purchase - ${totalPrice} One Time
                  </p>
                  <p className="text-gray-400 text-sm">Secure payment with PayPal</p>
                </div>
                
                {isProcessing && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-400">Processing payment...</span>
                    </div>
                  </div>
                )}
                
                <div ref={paypalRef} className={isProcessing ? 'opacity-50 pointer-events-none' : ''}></div>
                
                {!paypalLoaded && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-400">Loading payment options...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Security Info */}
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-xs">
                  🔒 Secure 256-bit SSL encryption • PayPal Buyer Protection • 30-day money-back guarantee
                </p>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="bg-gray-700/30 rounded-xl p-6 text-center">
              <h4 className="text-lg font-semibold text-white mb-3">Why Choose DevKlicks?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col items-center">
                  <Zap className="w-8 h-8 text-yellow-400 mb-2" />
                  <span className="text-white font-medium">Instant Access</span>
                  <span className="text-gray-400">No monthly fees</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="w-8 h-8 text-green-400 mb-2" />
                  <span className="text-white font-medium">Secure & Private</span>
                  <span className="text-gray-400">Your data stays safe</span>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="w-8 h-8 text-purple-400 mb-2" />
                  <span className="text-white font-medium">Professional Tools</span>
                  <span className="text-gray-400">Built for developers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 pt-6 border-t border-gray-700/50">
          <div className="text-center text-gray-400">
            <p className="mb-3 text-lg">✨ 30-day money-back guarantee</p>
            <p className="text-base">Secure payment • No hidden fees • Instant activation</p>
          </div>
        </div>
      </div>
    </div>
  )
}