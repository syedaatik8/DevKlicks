import React from 'react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Settings,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  CreditCard,
  Download
} from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const stats = [
    {
      name: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      changeType: 'positive',
      icon: DollarSign,
      description: 'from last month'
    },
    {
      name: 'Subscriptions',
      value: '+2350',
      change: '+180.1%',
      changeType: 'positive',
      icon: Users,
      description: 'from last month'
    },
    {
      name: 'Sales',
      value: '+12,234',
      change: '+19%',
      changeType: 'positive',
      icon: CreditCard,
      description: 'from last month'
    },
    {
      name: 'Active Now',
      value: '+573',
      change: '+201',
      changeType: 'positive',
      icon: Activity,
      description: 'since last hour'
    },
  ];

  const recentSales = [
    {
      name: 'Olivia Martin',
      email: 'olivia.martin@email.com',
      amount: '+$1,999.00',
      avatar: 'OM'
    },
    {
      name: 'Jackson Lee',
      email: 'jackson.lee@email.com',
      amount: '+$39.00',
      avatar: 'JL'
    },
    {
      name: 'Isabella Nguyen',
      email: 'isabella.nguyen@email.com',
      amount: '+$299.00',
      avatar: 'IN'
    },
    {
      name: 'William Kim',
      email: 'will@email.com',
      amount: '+$99.00',
      avatar: 'WK'
    },
    {
      name: 'Sofia Davis',
      email: 'sofia.davis@email.com',
      amount: '+$39.00',
      avatar: 'SD'
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Dashboard
          </h2>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              <Download className="mr-2 h-4 w-4" />
              Download
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="rounded-xl border bg-card text-card-foreground shadow bg-white p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-gray-600">
                  {stat.name}
                </div>
                <stat.icon className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span className="ml-1">{stat.description}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {/* Overview Chart */}
          <div className="xl:col-span-2">
            <div className="rounded-xl border bg-card text-card-foreground shadow bg-white">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Overview</h3>
              </div>
              <div className="p-6 pt-0">
                <div className="h-[350px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chart visualization would go here</p>
                    <p className="text-sm text-gray-500 mt-2">Revenue analytics and trends</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="rounded-xl border bg-card text-card-foreground shadow bg-white">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Recent Sales</h3>
              <p className="text-sm text-gray-600">You made 265 sales this month.</p>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-8">
                {recentSales.map((sale, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">{sale.avatar}</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{sale.name}</p>
                      <p className="text-sm text-gray-600">{sale.email}</p>
                    </div>
                    <div className="ml-auto font-medium">{sale.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Cards */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow bg-white">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Recent Activity</h3>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New user registered</p>
                      <p className="text-xs text-gray-600">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment received</p>
                      <p className="text-xs text-gray-600">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System update completed</p>
                      <p className="text-xs text-gray-600">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="rounded-xl border bg-card text-card-foreground shadow bg-white">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Quick Actions</h3>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-sm font-medium">Create New Project</span>
                    <Plus className="h-4 w-4" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-sm font-medium">Generate Report</span>
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-sm font-medium">Manage Users</span>
                    <Users className="h-4 w-4" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-sm font-medium">View Analytics</span>
                    <TrendingUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;