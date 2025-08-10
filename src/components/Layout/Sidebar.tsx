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
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 text-gray-900 z-50 transition-transform duration-300 ease-in-out shadow-sm
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 lg:relative lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/src/images/DevKlicks-light.png" 
              alt="DevKlicks" 
              className="w-[120px] h-auto object-contain"
            />
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                    item.href === '/dashboard' 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${
                    item.href === '/dashboard' 
                      ? 'text-gray-700' 
                      : 'text-gray-400 group-hover:text-gray-700'
                  }`} />
                  <span className={item.href === '/dashboard' ? 'font-medium' : ''}>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
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
              <p className="text-xs text-gray-500">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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