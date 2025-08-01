import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, Crown, ChevronDown, Camera } from 'lucide-react'

interface UserDropdownProps {
  onUpgradeClick: () => void
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ onUpgradeClick }) => {
  const { user, userTier, signOut } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
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
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
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
        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[99999]">
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
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button 
                  onClick={handleSettings}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
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
                  <div className={`w-2 h-2 rounded-full mr-2 ${isPremium ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
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
            
            <div className="border-t border-gray-700/50 my-2"></div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-left rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}