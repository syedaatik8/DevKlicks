import React from 'react';
import { BarChart3, Users, MessageSquare, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const stats = [
    {
      name: 'Total Contacts',
      value: '2,345',
      change: '+4.75%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Active Conversations',
      value: '45',
      change: '+12.3%',
      changeType: 'positive',
      icon: MessageSquare,
    },
    {
      name: 'Conversion Rate',
      value: '3.65%',
      change: '-0.8%',
      changeType: 'negative',
      icon: TrendingUp,
    },
    {
      name: 'Revenue',
      value: '$12,456',
      change: '+8.2%',
      changeType: 'positive',
      icon: BarChart3,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.first_name || profile?.username || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Placeholder */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                We're working on bringing you powerful tools and insights. 
                Stay tuned for updates!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;