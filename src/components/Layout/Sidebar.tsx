import React from 'react';
import { 
  Home, 
  Settings, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Calendar,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { profile, signOut } = useAuth();

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Contacts', href: '/contacts' },
    { icon: MessageSquare, label: 'Conversations', href: '/conversations' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gray-700 text-white z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 lg:relative lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            <img 
              src="/src/images/DevKlicks-logo.png" 
              alt="DevKlicks" 
              className="w-8 h-8 rounded-lg"
            />
            <h1 className="text-xl font-bold">DevKlicks</h1>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors group"
                >
                  <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  <span className="group-hover:text-white">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-600 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {profile?.first_name?.[0] || profile?.username?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.username || 'User'
                }
              </p>
              <p className="text-xs text-gray-400">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;