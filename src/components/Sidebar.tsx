import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Settings, 
  Image, 
  FileText, 
  Database, 
  Terminal, 
  Crown, 
  Palette, 
  Square, 
  ChevronLeft, 
  ChevronRight,
  QrCode,
  Type,
  Scissors
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onPremiumClick: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onToggleCollapse, 
  onPremiumClick 
}) => {
  const location = useLocation()

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', premium: false },
    { icon: Image, label: 'Image Resizer', path: '/image-resizer', premium: false },
    { icon: Scissors, label: 'Remove Background', path: '/remove-background', premium: false },
    { icon: Palette, label: 'Color Picker', path: '/color-picker', premium: false },
    { icon: Square, label: 'Favicon Generator', path: '/favicon-generator', premium: false },
    { icon: QrCode, label: 'QR Code Generator', path: '/qr-generator', premium: false },
    { icon: Type, label: 'Content Generator', path: '/content-generator', premium: false },
    { icon: FileText, label: 'PDF Tools', path: '#', premium: true },
    { icon: Database, label: 'JSON Formatter', path: '#', premium: true },
    { icon: Terminal, label: 'Code Generator', path: '#', premium: true },
  ]

  const handleMenuClick = (item: typeof menuItems[0], e: React.MouseEvent) => {
    if (item.premium && item.path === '#') {
      e.preventDefault()
      onPremiumClick()
    }
  }

  return (
    <div className={`fixed inset-y-0 left-0 bg-gray-800/50 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-300 z-40 flex flex-col ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo */}
      <div className={`flex items-center py-6 border-b border-gray-700/50 flex-shrink-0 ${
        collapsed ? 'justify-center px-4' : 'px-6'
      }`}>
        {!collapsed && (
          <img 
            src="/DevKlicks-light.png" 
            alt="DevKlicks" 
            className="h-8"
          />
        )}
        {collapsed && (
          <img 
            src="/DevKlicks-icon.png" 
            alt="DevKlicks" 
            className="w-10 h-10"
          />
        )}
      </div>

      {/* Navigation - Scrollable with custom scrollbar */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 relative group border border-transparent ${
                isActive
                  ? 'bg-purple-600/20 text-purple-400 border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
              } ${item.premium && item.path === '#' ? 'cursor-pointer' : ''} ${
                collapsed ? 'justify-center px-3' : ''
              }`}
              onClick={(e) => handleMenuClick(item, e)}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
              {!collapsed && (
                <>
                  {item.label}
                  {item.premium && item.path === '#' && (
                    <Crown className="w-4 h-4 ml-auto text-yellow-500" />
                  )}
                </>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  {item.premium && item.path === '#' && <Crown className="w-3 h-3 inline ml-1 text-yellow-500" />}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section - Sticky */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700/50 space-y-2">
        <Link
          to="/settings"
          className={`w-full flex items-center px-4 py-3 text-gray-400 hover:text-gray-300 hover:bg-gray-700/30 rounded-lg transition-all duration-200 group border border-transparent ${
            collapsed ? 'justify-center px-3' : ''
          } ${location.pathname === '/settings' ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' : ''}`}
        >
          <Settings className={`w-5 h-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && 'Settings'}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
              Settings
            </div>
          )}
        </Link>
        
        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center px-4 py-3 text-gray-500 hover:text-gray-400 hover:bg-gray-700/30 rounded-lg transition-all duration-200 group border border-transparent z-10 ${
            collapsed ? 'justify-center px-3' : ''
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0 mr-3" />
              Collapse
            </>
          )}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
              Expand sidebar
            </div>
          )}
        </button>
      </div>
    </div>
  )
}