import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  ChevronDown, 
  MapPin, 
  Users, 
  Bell, 
  ExternalLink, 
  Edit3, 
  Globe,
  CreditCard,
  Calendar,
  Download,
  ChevronRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('Subscription');

  const sidebarItems = [
    'Site statistics',
    'General info',
    'Blog',
    'Form management',
    'Integration',
    'Custom style',
    'Subscription',
    'Help Center'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">FeatherDev</h1>
              <div className="flex items-center text-sm text-gray-500">
                <span>Myshop</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item}>
                <button
                  onClick={() => setActiveTab(item)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    activeTab === item
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item}
                  {item === 'General info' && <ChevronRight className="w-4 h-4" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Upgrade Card */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
              </div>
              <p className="text-sm font-medium mb-1">You're now enjoying</p>
              <p className="text-sm font-medium mb-3">free plan</p>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center">
                Upgrade to Pro
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Hire a</span>
                <span className="text-sm font-medium text-gray-900">Professional</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-900">Useful Tips</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Draft</span>
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">example.emiliano.com</span>
              </div>
              <button className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
                <Edit3 className="w-4 h-4" />
                <span>Edit site</span>
              </button>
              <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
                Publish
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl">
            {/* Active Plan Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-gray-900">Active Plan</h1>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  • STANDARD
                </span>
              </div>
              <button className="text-red-600 text-sm font-medium hover:text-red-700">
                Cancel Plan
              </button>
            </div>

            {/* Plan Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-600 font-medium text-sm">STANDARD</span>
                  </div>
                  <p className="text-sm text-blue-600">(Manage Package)</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expiration date</p>
                  <p className="text-sm font-medium text-gray-900">September 20, 2022</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2 mb-1">
                    <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="text-sm text-gray-600">PayPal</span>
                    <button className="text-blue-600 text-sm">(Change)</button>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">$10/<span className="text-sm font-normal text-gray-600">month</span></p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {/* PayPal */}
                <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">PayPal</span>
                    </div>
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    You're still using a default<br />
                    charges workflow but automatic.
                  </p>
                  <button className="text-blue-600 text-sm font-medium">Remove</button>
                </div>

                {/* Stripe */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-purple-600">stripe</div>
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    You're still using a default<br />
                    charges workflow but automatic.
                  </p>
                  <button className="text-blue-600 text-sm font-medium">Remove</button>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h2>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Purchase date</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">End date</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Package name</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Payment method</th>
                        <th className="w-12 py-3 px-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-4 px-6 text-sm text-gray-900">September 20, 2022</td>
                        <td className="py-4 px-6 text-sm text-gray-900">September 20, 2022</td>
                        <td className="py-4 px-6 text-sm text-gray-900">Standard plan</td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">$125.00</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs font-bold">P</span>
                            </div>
                            <span className="text-sm text-blue-600 font-medium">PayPal</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button className="text-gray-400 hover:text-gray-600">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 text-sm text-gray-900">September 20, 2022</td>
                        <td className="py-4 px-6 text-sm text-gray-900">September 20, 2022</td>
                        <td className="py-4 px-6 text-sm text-gray-900">Standard plan</td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">$125.00</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-purple-600 font-bold">stripe</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button className="text-gray-400 hover:text-gray-600">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;