import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useUsageTracking } from '../hooks/useUsageTracking'
import { Crown, Plus, Type, Scissors } from 'lucide-react'
import { PremiumModal } from '../components/PremiumModal'
import { UserDropdown } from '../components/UserDropdown'
import { Sidebar } from '../components/Sidebar'
import { Footer } from '../components/Footer'

export const Dashboard: React.FC = () => {
  const { user, userTier } = useAuth()
  const navigate = useNavigate()
  const { usage, loading: usageLoading } = useUsageTracking()
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleImageResizerClick = () => {
    navigate('/image-resizer')
  }

  const handleRemoveBackgroundClick = () => {
    navigate('/remove-background')
  }

  const handleColorPickerClick = () => {
    navigate('/color-picker')
  }

  const handleFaviconGeneratorClick = () => {
    navigate('/favicon-generator')
  }

  const handleQRGeneratorClick = () => {
    navigate('/qr-generator')
  }

  const handleContentGeneratorClick = () => {
    navigate('/content-generator')
  }

  const isPremium = userTier === 'premium'

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
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user?.user_metadata?.full_name || 'Developer'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              {!isPremium && (
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade
                </button>
              )}
              <UserDropdown onUpgradeClick={() => setShowPremiumModal(true)} />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-8">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-600/20 border border-purple-500/30 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to DevKlicks! 🚀
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Your all-in-one developer toolkit is ready to boost your productivity. 
              Get access to essential tools that every developer needs.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleImageResizerClick}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Image Resizer
              </button>
              <button 
                onClick={handleRemoveBackgroundClick}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Background Remover
              </button>
              <button 
                onClick={handleColorPickerClick}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Color Picker
              </button>
              <button 
                onClick={handleFaviconGeneratorClick}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Favicon Generator
              </button>
              <button 
                onClick={handleQRGeneratorClick}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Try QR Generator
              </button>
              <button 
                onClick={handleContentGeneratorClick}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Content Generator
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Images Resized Today</h3>
                <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-purple-400 rounded-sm" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-2">
                {usageLoading ? '...' : `${usage.imageResizes}/${usage.maxImageResizes}`}
              </p>
              <p className="text-sm text-gray-400">Daily limit</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Tools Available</h3>
                <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-3 h-3 text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-2">6</p>
              <p className="text-sm text-gray-400">More coming soon</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Account Status</h3>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  isPremium ? 'bg-yellow-500/20' : 'bg-purple-500/20'
                }`}>
                  <Crown className={`w-3 h-3 ${
                    isPremium ? 'text-yellow-400' : 'text-purple-400'
                  }`} />
                </div>
              </div>
              <p className={`text-3xl font-bold mb-2 ${
                isPremium ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {isPremium ? 'Premium' : 'Free'}
              </p>
              <p className="text-sm text-gray-400">
                {isPremium ? 'All features unlocked' : 'Upgrade for more features'}
              </p>
            </div>
          </div>

          {/* Available Tools */}
          <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Available Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Image Resizer Tool */}
              <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-white rounded-sm" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Image Resizer</h4>
                <p className="text-gray-400 text-sm mb-4">Resize images with custom dimensions or percentage scaling. Support for multiple formats.</p>
                <button 
                  onClick={handleImageResizerClick}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Use Tool
                </button>
              </div>

              {/* Background Remover Tool */}
              <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Remove Background</h4>
                <p className="text-gray-400 text-sm mb-4">AI-powered background removal for photos. Perfect for product images and portraits.</p>
                <button 
                  onClick={handleRemoveBackgroundClick}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Use Tool
                </button>
              </div>

              {/* Color Picker Tool */}
              <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-blue-400 rounded-full" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Color Picker</h4>
                <p className="text-gray-400 text-sm mb-4">Generate beautiful color palettes from colors, logos, or random themes.</p>
                <button 
                  onClick={handleColorPickerClick}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Use Tool
                </button>
              </div>

              {/* Favicon Generator Tool */}
              <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-white rounded-sm" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Favicon Generator</h4>
                <p className="text-gray-400 text-sm mb-4">Create professional favicons in multiple sizes from your logo or icon.</p>
                <button 
                  onClick={handleFaviconGeneratorClick}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Use Tool
                </button>
              </div>

              {/* QR Code Generator Tool */}
              <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className={`bg-white ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-30'}`} />
                    ))}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">QR Code Generator</h4>
                <p className="text-gray-400 text-sm mb-4">Create QR codes for URLs with multiple formats and sizes. Bulk generation available.</p>
                <button 
                  onClick={handleQRGeneratorClick}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Use Tool
                </button>
              </div>

              {/* Content Generator Tool */}
              <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Type className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Content Generator</h4>
                <p className="text-gray-400 text-sm mb-4">Generate Lorem Ipsum text for placeholder content in your designs and projects.</p>
                <button 
                  onClick={handleContentGeneratorClick}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Use Tool
                </button>
              </div>

              {/* Premium Tools Preview */}
              {!isPremium && (
                <div 
                  onClick={() => setShowPremiumModal(true)}
                  className="bg-gray-700/20 border border-gray-600/30 rounded-xl p-6 relative opacity-75 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Crown className="absolute top-4 right-4 w-5 h-5 text-yellow-500" />
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-white rounded-sm" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">PDF Tools</h4>
                  <p className="text-gray-400 text-sm mb-4">Merge, split, compress and convert PDF files with ease.</p>
                  <button className="w-full bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Upgrade to Access
                  </button>
                </div>
              )}
            </div>
          </div>
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