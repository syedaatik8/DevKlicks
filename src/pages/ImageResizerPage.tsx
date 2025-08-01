import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUsageTracking } from '../hooks/useUsageTracking'
import { ArrowLeft } from 'lucide-react'
import { ImageResizer } from '../components/ImageResizer'
import { PremiumModal } from '../components/PremiumModal'
import { UserDropdown } from '../components/UserDropdown'
import { Sidebar } from '../components/Sidebar'
import { Footer } from '../components/Footer'
import { Link } from 'react-router-dom'

export const ImageResizerPage: React.FC = () => {
  const { user, signOut } = useAuth()
  const { usage } = useUsageTracking()
  const [signingOut, setSigningOut] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onPremiumClick={() => setShowPremiumModal(true)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-gray-800/30 backdrop-blur-xl border-b border-gray-700/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                to="/dashboard"
                className="mr-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Image Resizer</h1>
                <p className="text-gray-400">Resize and convert images with ease</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                <span className="text-sm font-medium">{usage.imageResizes}/{usage.maxImageResizes} Daily Resizes</span>
              </div>
              <UserDropdown onUpgradeClick={() => setShowPremiumModal(true)} />
            </div>
          </div>
        </header>

        {/* Tool Content */}
        <main className="flex-1 p-8">
          <ImageResizer />
        </main>
        
        <Footer />
      </div>

      {/* Premium Modal */}
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </div>
  )
}