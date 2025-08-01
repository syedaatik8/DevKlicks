import React, { useState } from 'react'
import { X, Crown, Check, Zap, Star, Users } from 'lucide-react'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PricingPlan {
  name: string
  icon: React.ComponentType<any>
  price: {
    monthly: number
    yearly: number
    lifetime: number
  }
  features: string[]
  popular?: boolean
  color: string
}

const plans: PricingPlan[] = [
  {
    name: 'Hobbyist',
    icon: Zap,
    price: { monthly: 9, yearly: 90, lifetime: 199 },
    features: [
      '50 image resizes/day',
      'PDF tools access',
      'JSON formatter',
      'Basic support',
      'No watermarks'
    ],
    color: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Pro',
    icon: Crown,
    price: { monthly: 19, yearly: 190, lifetime: 399 },
    features: [
      'Unlimited image resizes',
      'All PDF tools',
      'Advanced JSON tools',
      'Code generators',
      'Priority support',
      'API access',
      'Batch processing'
    ],
    popular: true,
    color: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Agency',
    icon: Users,
    price: { monthly: 49, yearly: 490, lifetime: 999 },
    features: [
      'Everything in Pro',
      'Team collaboration',
      'White-label options',
      'Custom integrations',
      'Dedicated support',
      'Usage analytics',
      'Custom limits'
    ],
    color: 'from-emerald-500 to-emerald-600'
  }
]

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'lifetime'>('monthly')

  if (!isOpen) return null

  const handlePlanSelect = (plan: PricingPlan) => {
    // TODO: Integrate with payment gateway
    console.log(`Selected ${plan.name} - ${billingCycle}`)
    // For now, just close the modal
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-8 z-50 overflow-hidden">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto scrollbar-hide">
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
            <h2 className="text-4xl font-bold text-white mb-3">Upgrade to Premium</h2>
            <p className="text-gray-400 text-lg">Unlock powerful developer tools and boost your productivity</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="p-10 pb-6">
          <div className="flex items-center justify-center mb-10">
            <div className="bg-gray-700/50 rounded-xl p-2 flex space-x-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-lg text-base font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-8 py-3 rounded-lg text-base font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
              <button
                onClick={() => setBillingCycle('lifetime')}
                className={`px-8 py-3 rounded-lg text-base font-medium transition-all relative ${
                  billingCycle === 'lifetime'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Lifetime
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  Best
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-gray-700/30 border rounded-2xl p-8 transition-all duration-200 hover:scale-105 flex flex-col h-full ${
                  plan.popular
                    ? 'border-purple-500/50 ring-2 ring-purple-500/20'
                    : 'border-gray-600/50 hover:border-gray-500/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium px-4 py-2 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-6`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="text-5xl font-bold text-white mb-2">
                    ${plan.price[billingCycle]}
                    {billingCycle !== 'lifetime' && (
                      <span className="text-xl text-gray-400 font-normal">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-gray-400">
                      ${(plan.price.yearly / 12).toFixed(0)}/month billed yearly
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-green-400 mr-4 flex-shrink-0" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] text-lg mt-auto`}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 pt-6 border-t border-gray-700/50">
          <div className="text-center text-gray-400">
            <p className="mb-3 text-lg">✨ All plans include a 14-day free trial</p>
            <p className="text-base">Cancel anytime • No hidden fees • Secure payment</p>
          </div>
        </div>
      </div>
    </div>
  )
}