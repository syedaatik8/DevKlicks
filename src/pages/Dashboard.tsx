import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ChevronDown, 
  Settings, 
  LogOut, 
  User,
  Image,
  Palette,
  Code,
  Scissors,
  FileText,
  Zap,
  Download,
  Upload,
  BarChart3,
  Activity,
  TrendingUp,
  Clock,
  Star,
  Plus
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');

  const developerTools = [
    { 
      name: 'Overview', 
      icon: BarChart3, 
      description: 'Dashboard overview',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      name: 'Image Resizer', 
      icon: Image, 
      description: 'Resize images instantly',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      name: 'Background Remover', 
      icon: Scissors, 
      description: 'Remove backgrounds with AI',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      name: 'Color Palette Generator', 
      icon: Palette, 
      description: 'Generate beautiful color schemes',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    { 
      name: 'CSS Simplifier', 
      icon: Code, 
      description: 'Optimize and clean CSS',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      name: 'JS Minifier', 
      icon: Zap, 
      description: 'Minify JavaScript code',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    { 
      name: 'Text Formatter', 
      icon: FileText, 
      description: 'Format and beautify text',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ];

  const bottomNavItems = [
    { name: 'Help', icon: User, description: 'Get help and support' },
    { name: 'Settings', icon: Settings, description: 'App preferences' }
  ];

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`;
    }
    return profile?.username?.[0]?.toUpperCase() || 'U';
  };

  const stats = [
    { label: 'Tools Used', value: '24', change: '+12%', trend: 'up' },
    { label: 'Files Processed', value: '1,247', change: '+8%', trend: 'up' },
    { label: 'Time Saved', value: '45h', change: '+23%', trend: 'up' },
    { label: 'Storage Used', value: '2.4GB', change: '+5%', trend: 'up' }
  ];

  const recentActivity = [
    { tool: 'Image Resizer', file: 'hero-banner.jpg', time: '2 minutes ago', status: 'completed' },
    { tool: 'CSS Simplifier', file: 'styles.css', time: '15 minutes ago', status: 'completed' },
    { tool: 'Background Remover', file: 'product-photo.png', time: '1 hour ago', status: 'completed' },
    { tool: 'Color Palette Generator', file: 'brand-colors.json', time: '2 hours ago', status: 'completed' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700 flex justify-center">
          <img 
            src="/src/images/DevKlicks-dark.png" 
            alt="DevKlicks" 
            className="w-[140px] h-auto object-cover"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {developerTools.map((tool) => (
              <li key={tool.name}>
                <button
                  onClick={() => setActiveFeature(tool.name)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeFeature === tool.name
                      ? `bg-purple-600 text-white shadow-sm`
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <tool.icon className={`w-5 h-5 ${
                      activeFeature === tool.name ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                    }`} />
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        activeFeature === tool.name ? 'text-white' : ''
                      }`}>
                        {tool.name}
                      </div>
                      <div className={`text-xs mt-0.5 ${
                        activeFeature === tool.name ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {tool.description}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 space-y-2">
          {bottomNavItems.map((item) => (
            <button
              key={item.name}
              className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Upgrade Section */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center mb-3">
              <Star className="w-5 h-5 text-yellow-300 mr-2" />
              <span className="text-sm font-medium">Pro Features</span>
            </div>
            <p className="text-xs text-purple-100 mb-3">
              Unlock advanced tools and unlimited processing
            </p>
            <button className="w-full bg-white text-purple-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search tools, files, or features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {getInitials()}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile?.username || profile?.email?.split('@')[0] || 'User'
                    }
                  </p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {getInitials()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {profile?.first_name && profile?.last_name 
                            ? `${profile.first_name} ${profile.last_name}`
                            : profile?.username || profile?.email?.split('@')[0] || 'User'
                          }
                        </p>
                        <p className="text-xs text-gray-500">{profile?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Upload className="w-4 h-4 mr-3 text-gray-400" />
                      Upload Profile Picture
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      Profile Settings
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Preferences
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={signOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeFeature === 'Overview' ? (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`flex items-center text-sm ${
                        stat.trend === 'up' ? 'text-purple-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {stat.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {developerTools.slice(1, 5).map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => setActiveFeature(tool.name)}
                      className={`p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors group`}
                    >
                      <tool.icon className={`w-8 h-8 ${tool.color} mx-auto mb-2`} />
                      <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                        {tool.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Activity className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.tool} - {activity.file}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">{activity.time}</p>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-xs text-purple-600 font-medium">Completed</span>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Tool-specific content
            <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
              <div className="max-w-md mx-auto">
                {(() => {
                  const tool = developerTools.find(t => t.name === activeFeature);
                  return tool ? (
                    <>
                      <div className={`w-16 h-16 ${tool.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <tool.icon className={`w-8 h-8 ${tool.color}`} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{tool.name}</h2>
                      <p className="text-gray-600 mb-6">{tool.description}</p>
                      <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center mx-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Get Started
                      </button>
                    </>
                  ) : null;
                })()}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;