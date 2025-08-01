import React, { useState } from 'react'
import { X } from 'lucide-react'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="text-gray-300 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const openModal = (modalType: string) => {
    setActiveModal(modalType)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <>
      <footer className="bg-gray-800/30 backdrop-blur-xl border-t border-gray-700/50 py-6 px-8 mt-auto">
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            © 2025 DevKlicks. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4 text-gray-400 text-sm">
              <span>+1 (424) 209-3770</span>
              <span>•</span>
              <span>support@devklicks.xyz</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => openModal('terms')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => openModal('privacy')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => openModal('refund')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Return/Refund Policy
              </button>
              <button
                onClick={() => openModal('shipping')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Shipping/Service Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Terms & Conditions Modal */}
      <LegalModal
        isOpen={activeModal === 'terms'}
        onClose={closeModal}
        title="Terms & Conditions"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-400">Last updated: January 2025</p>
          
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h3>
            <p>By accessing and using DevKlicks ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. DevKlicks is operated by DevKlicks LLC, located at 828 Ralph McGill Blvd NE, Atlanta, GA 30306, United States.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">2. Description of Service</h3>
            <p>DevKlicks provides web-based developer tools including but not limited to image processing, QR code generation, color palette creation, favicon generation, and content generation tools. Our services are designed to enhance developer productivity and streamline common development tasks.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">3. User Accounts</h3>
            <p>To access certain features of the Service, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">4. Subscription Plans</h3>
            <p>DevKlicks offers both free and premium subscription plans. Free accounts have usage limitations, while premium accounts provide enhanced features and higher usage limits. Subscription fees are billed in advance and are non-refundable except as expressly stated in our Refund Policy.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">5. Acceptable Use</h3>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Upload or process illegal, harmful, or copyrighted content without permission</li>
              <li>Attempt to reverse engineer or compromise the security of our systems</li>
              <li>Use automated tools to access the Service beyond normal usage patterns</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">6. Intellectual Property</h3>
            <p>The Service and its original content, features, and functionality are owned by DevKlicks and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You retain ownership of content you upload, but grant us a license to process it for service delivery.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">7. Third-Party Services</h3>
            <p>Our Service may integrate with third-party APIs and services to provide enhanced functionality. We are not responsible for the availability, accuracy, or reliability of these third-party services. Usage of such services may be subject to additional terms and conditions.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h3>
            <p>DevKlicks shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">9. Termination</h3>
            <p>We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">10. Contact Information</h3>
            <p>For questions about these Terms, please contact us at:</p>
            <div className="ml-4">
              <p>Email: support@devklicks.xyz</p>
              <p>Phone: +1 (424) 209-3770</p>
              <p>Address: 828 Ralph McGill Blvd NE, Atlanta, GA 30306, United States</p>
            </div>
          </section>
        </div>
      </LegalModal>

      {/* Privacy Policy Modal */}
      <LegalModal
        isOpen={activeModal === 'privacy'}
        onClose={closeModal}
        title="Privacy Policy"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-400">Last updated: January 2025</p>
          
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Account information (name, email address, phone number)</li>
              <li>Profile information (avatar, preferences)</li>
              <li>Usage data (features used, processing history)</li>
              <li>Payment information (processed securely through third-party providers)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Monitor and analyze usage patterns to improve user experience</li>
              <li>Detect and prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h3>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>With your explicit consent</li>
              <li>To trusted service providers who assist in operating our service</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h3>
            <p>Our service integrates with third-party APIs including Clipdrop for AI-powered image processing. When you use these features, your data may be processed by these third-party services according to their privacy policies. We recommend reviewing their privacy practices.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">5. Data Security</h3>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">6. Data Retention</h3>
            <p>We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy, unless a longer retention period is required by law.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">7. Your Rights</h3>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">8. Cookies and Tracking</h3>
            <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">9. Contact Us</h3>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <div className="ml-4">
              <p>Email: support@devklicks.xyz</p>
              <p>Phone: +1 (424) 209-3770</p>
              <p>Address: 828 Ralph McGill Blvd NE, Atlanta, GA 30306, United States</p>
            </div>
          </section>
        </div>
      </LegalModal>

      {/* Return/Refund Policy Modal */}
      <LegalModal
        isOpen={activeModal === 'refund'}
        onClose={closeModal}
        title="Return/Refund Policy"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-400">Last updated: January 2025</p>
          
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">1. Refund Eligibility</h3>
            <p>DevKlicks offers refunds under the following conditions:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Refund requests must be made within 14 days of purchase</li>
              <li>Service must not have been extensively used (defined as less than 25% of monthly limits)</li>
              <li>Technical issues preventing service use that cannot be resolved by our support team</li>
              <li>Billing errors or duplicate charges</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">2. Non-Refundable Items</h3>
            <p>The following are not eligible for refunds:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Subscriptions that have been actively used beyond the trial period</li>
              <li>One-time purchases after 14 days</li>
              <li>Lifetime subscriptions after 30 days</li>
              <li>Services terminated due to Terms of Service violations</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">3. Refund Process</h3>
            <p>To request a refund:</p>
            <ol className="list-decimal list-inside ml-4 space-y-1 mt-2">
              <li>Contact our support team at support@devklicks.xyz</li>
              <li>Provide your account email and reason for refund request</li>
              <li>Include any relevant documentation or screenshots</li>
              <li>Allow 3-5 business days for review and processing</li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">4. Processing Time</h3>
            <p>Approved refunds will be processed within 5-10 business days and will appear on your original payment method. Processing times may vary depending on your bank or payment provider.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">5. Subscription Cancellations</h3>
            <p>You may cancel your subscription at any time through your account settings. Cancellations will take effect at the end of your current billing period, and you will retain access to premium features until that time.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">6. Partial Refunds</h3>
            <p>In certain circumstances, we may offer partial refunds based on usage and time remaining in your subscription period. These decisions are made on a case-by-case basis.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">7. Contact Information</h3>
            <p>For refund requests or questions about this policy, contact us at:</p>
            <div className="ml-4">
              <p>Email: support@devklicks.xyz</p>
              <p>Phone: +1 (424) 209-3770</p>
              <p>Address: 828 Ralph McGill Blvd NE, Atlanta, GA 30306, United States</p>
            </div>
          </section>
        </div>
      </LegalModal>

      {/* Shipping/Service Policy Modal */}
      <LegalModal
        isOpen={activeModal === 'shipping'}
        onClose={closeModal}
        title="Shipping/Service Policy"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-400">Last updated: January 2025</p>
          
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">1. Service Delivery</h3>
            <p>DevKlicks is a digital service platform. All services are delivered electronically through our web application. There are no physical products or shipping involved in our standard service offerings.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">2. Account Activation</h3>
            <p>Upon successful registration and payment (for premium accounts):</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Free accounts are activated immediately upon email verification</li>
              <li>Premium accounts are activated within minutes of payment confirmation</li>
              <li>You will receive a confirmation email with account details</li>
              <li>Access to premium features begins immediately upon activation</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">3. Service Availability</h3>
            <p>We strive to maintain 99.9% uptime for our services. However, service may be temporarily unavailable due to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Scheduled maintenance (announced in advance)</li>
              <li>Emergency maintenance or security updates</li>
              <li>Third-party service provider outages</li>
              <li>Force majeure events beyond our control</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">4. Usage Limits and Quotas</h3>
            <p>Service usage is subject to plan-specific limits:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Free accounts have daily usage limits per feature</li>
              <li>Premium accounts have higher limits or unlimited usage</li>
              <li>Limits reset daily at midnight UTC</li>
              <li>Overage protection prevents unexpected charges</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">5. Data Processing and Storage</h3>
            <p>Your uploaded content and generated results are:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Processed securely using industry-standard encryption</li>
              <li>Stored temporarily for service delivery</li>
              <li>Automatically deleted after processing (unless saved by user)</li>
              <li>Never shared with third parties without consent</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">6. Support Services</h3>
            <p>We provide customer support through:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
              <li>Email support: support@devklicks.xyz</li>
              <li>Phone support: +1 (424) 209-3770 (business hours)</li>
              <li>Response time: 24-48 hours for standard inquiries</li>
              <li>Priority support for premium subscribers</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">7. Service Modifications</h3>
            <p>We reserve the right to modify, suspend, or discontinue any part of our service with reasonable notice. Users will be notified of significant changes via email or in-app notifications.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">8. Geographic Availability</h3>
            <p>DevKlicks is available globally, but some features may be restricted in certain jurisdictions due to legal or technical limitations. We comply with applicable international data protection laws.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-white mb-3">9. Contact Information</h3>
            <p>For service-related questions or support, contact us at:</p>
            <div className="ml-4">
              <p>Email: support@devklicks.xyz</p>
              <p>Phone: +1 (424) 209-3770</p>
              <p>Address: 828 Ralph McGill Blvd NE, Atlanta, GA 30306, United States</p>
              <p>Business Hours: Monday-Friday, 9 AM - 6 PM EST</p>
            </div>
          </section>
        </div>
      </LegalModal>
    </>
  )
}