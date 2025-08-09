import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToastContext } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, Crown, ChevronDown, Camera } from 'lucide-react'

interface UserDropdownProps {
  onUpgradeClick: () => void
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ onUpgradeClick }) => {
  const { user, userTier, signOut } = useAuth()
  const toast = useToastContext()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleSignOut = async () => {
    if (isSigningOut) return
    
    setIsSigningOut(true)
    setIsOpen(false)
    
    try {
      const { error } = await signOut()
      if (!error) {
        toast.info('Signed out', 'You have been signed out successfully')
        navigate('/signin')
      } else {
        toast.error('Sign out failed', error.message)
      }
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleSettings = () => {
    navigate('/settings')
    setIsOpen(false)
  }

  const handleUpgrade = () => {
    onUpgradeClick()
    setIsOpen(false)
  }

  const avatarUrl = user?.user_metadata?.avatar_url
  const isPremium = userTier === 'premium'
  const userInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSigningOut}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors disabled:opacity-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {userInitial}
            </span>
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white truncate max-w-32">
            {user?.user_metadata?.full_name || 'Developer'}
          </p>
          <p className="text-xs text-gray-400">
            {isPremium ? 'Premium Plan' : 'Free Plan'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop - higher z-index than the dropdown but lower than the dropdown content */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[110]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown - highest z-index */}
          <div 
            className="fixed right-4 top-16 w-64 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[120] overflow-hidden"
          >
            {/* User Info */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {userInitial}
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={handleSettings}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors border border-gray-500"
                    aria-label="Change profile picture"
                  >
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.user_metadata?.full_name || 'Developer'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${isPremium ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <span className={`text-xs ${isPremium ? 'text-yellow-400' : 'text-green-400'}`}>
                      {isPremium ? 'Premium Plan' : 'Free Plan'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {!isPremium && (
                <button
                  onClick={handleUpgrade}
                  className="w-full flex items-center px-3 py-2 text-left rounded-lg hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Crown className="w-4 h-4 mr-3" />
                  Upgrade to Premium
                </button>
              )}
              
              <button
                onClick={handleSettings}
                className="w-full flex items-center px-3 py-2 text-left rounded-lg hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </button>
              
              <div className="border-t border-gray-700/50 my-2" />
              
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center px-3 py-2 text-left rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4 mr-3" />
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}