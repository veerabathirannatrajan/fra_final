import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFRAClaims } from '../hooks/useFRAClaims';
import { useAssets } from '../hooks/useAssets';
import { 
  MapIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  UserGroupIcon,
  MapPinIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { claims, getClaimStats } = useFRAClaims();
  const { assets, getAssetStats } = useAssets();
  const [claimStats, setClaimStats] = useState<any>(null);
  const [assetStats, setAssetStats] = useState<any>(null);

  // Mock data - replace with Supabase queries
  const overviewStats = [
    { 
      icon: DocumentTextIcon, 
      label: 'FRA Claims', 
      value: claimStats?.total?.toLocaleString() || '0', 
      change: '+1,250', 
      color: 'blue' 
    },
    { 
      icon: MapIcon, 
      label: 'IFR Pattas', 
      value: claimStats?.byType?.IFR?.toLocaleString() || '0', 
      change: '+890', 
      color: 'green' 
    },
    { 
      icon: UserGroupIcon, 
      label: 'CR Pattas', 
      value: claimStats?.byType?.CR?.toLocaleString() || '0', 
      change: '+340', 
      color: 'purple' 
    },
    { 
      icon: MapPinIcon, 
      label: 'CFR Areas', 
      value: claimStats?.byType?.CFR?.toLocaleString() || '0', 
      change: '+125', 
      color: 'orange' 
    },
    { 
      icon: FolderIcon, 
      label: 'Approved Claims', 
      value: claimStats?.byStatus?.approved?.toLocaleString() || '0', 
      change: '+2,340', 
      color: 'red' 
    },
    { 
      icon: ChartBarIcon, 
      label: 'Asset Maps', 
      value: assetStats?.total?.toLocaleString() || '0', 
      change: '+85', 
      color: 'indigo' 
    },
  ];

  const chartData = [
    { month: 'Jan', claims: 48200, pattas: 16800 },
    { month: 'Feb', claims: 49100, pattas: 17200 },
    { month: 'Mar', claims: 49800, pattas: 17650 },
    { month: 'Apr', claims: 50500, pattas: 18100 },
    { month: 'May', claims: 51200, pattas: 18800 },
    { month: 'Jun', claims: 52340, pattas: 19450 },
  ];

  const landTypeData = [
    { name: 'IFR (Individual)', value: 65, color: '#10B981' },
    { name: 'CR (Community)', value: 25, color: '#F59E0B' },
    { name: 'CFR (Forest Resource)', value: 10, color: '#3B82F6' },
  ];

  const stateData = [
    { state: 'Odisha', districts: 8, villages: 1250, claims: 18500 },
    { state: 'Jharkhand', districts: 6, villages: 980, claims: 12800 },
    { state: 'Chhattisgarh', districts: 5, villages: 750, claims: 9200 },
    { state: 'Madhya Pradesh', districts: 4, villages: 620, claims: 7400 },
    { state: 'Andhra Pradesh', districts: 3, villages: 480, claims: 4440 },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FRA Atlas Dashboard</h1>
          <p className="text-gray-600">Comprehensive view of Forest Rights Act implementation and progress</p>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {overviewStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${getColorClasses(stat.color)} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-green-600 font-medium">{stat.change}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Land Parcels Growth</h3>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">FRA Claims & Pattas Progress</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="claims"
                    stroke="#3B82F6"
                    fill="url(#colorClaims)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Land Type Distribution</h3>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">FRA Rights Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={landTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {landTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* State-wise Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">State-wise Overview</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              View All States
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">State</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Districts</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Villages</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">FRA Claims</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Progress</th>
                </tr>
              </thead>
              <tbody>
                {stateData.map((state, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{state.state}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{state.districts}</td>
                    <td className="py-4 px-4 text-gray-600">{state.villages}</td>
                    <td className="py-4 px-4 text-gray-600">{state.claims.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(state.claims / 18500) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-0">
                          {Math.round((state.claims / 18500) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl">
            <MapIcon className="h-6 w-6 mb-2" />
            <div className="text-sm font-medium">Open Maps</div>
          </button>
          <button className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl">
            <ChartBarIcon className="h-6 w-6 mb-2" />
            <div className="text-sm font-medium">View Analytics</div>
          </button>
          <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl">
            <DocumentTextIcon className="h-6 w-6 mb-2" />
            <div className="text-sm font-medium">Decision Support</div>
          </button>
          <button className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-xl">
            <FolderIcon className="h-6 w-6 mb-2" />
            <div className="text-sm font-medium">Upload Files</div>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;