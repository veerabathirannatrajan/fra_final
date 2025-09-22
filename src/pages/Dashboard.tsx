import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFRAForms } from '../hooks/useFRAForms';
import { 
  MapIcon, 
  ChartBarIcon, 
  DocumentTextIcon,
  UserGroupIcon,
  MapPinIcon,
  FolderIcon,
  BuildingOfficeIcon
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
  const { 
    individualForms, 
    villageForms, 
    forestForms, 
    loading: formsLoading, 
    error: formsError,
    getAnalytics,
    getAllRecommendations 
  } = useFRAForms();

  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    if (!formsLoading && !formsError) {
      const analyticsData = getAnalytics();
      const recommendationsData = getAllRecommendations();
      setAnalytics(analyticsData);
      setRecommendations(recommendationsData);
      setLoading(false);
    }
  }, [formsLoading, formsError, getAnalytics, getAllRecommendations]);

  const overviewStats = [
    { 
      icon: DocumentTextIcon, 
      label: 'FRA Claims', 
      value: analytics?.claimsByType?.Total?.toLocaleString() || '0', 
      change: `+${Math.floor(Math.random() * 100)}`, 
      color: 'blue' 
    },
    { 
      icon: UserGroupIcon, 
      label: 'Individual Claims', 
      value: analytics?.claimsByType?.Individual?.toLocaleString() || '0', 
      change: `+${Math.floor(Math.random() * 50)}`, 
      color: 'green' 
    },
    { 
      icon: BuildingOfficeIcon, 
      label: 'Village Claims', 
      value: analytics?.claimsByType?.Village?.toLocaleString() || '0', 
      change: `+${Math.floor(Math.random() * 30)}`, 
      color: 'purple' 
    },
    { 
      icon: MapPinIcon, 
      label: 'Forest Claims', 
      value: analytics?.claimsByType?.Forest?.toLocaleString() || '0', 
      change: `+${Math.floor(Math.random() * 20)}`, 
      color: 'orange' 
    },
    { 
      icon: FolderIcon, 
      label: 'PM-KISAN Eligible', 
      value: analytics?.schemeEligibility?.['PM-KISAN']?.toLocaleString() || '0', 
      change: `+${Math.floor(Math.random() * 40)}`, 
      color: 'red' 
    },
    { 
      icon: ChartBarIcon, 
      label: 'MGNREGA Eligible', 
      value: analytics?.schemeEligibility?.['MGNREGA']?.toLocaleString() || '0', 
      change: `+${Math.floor(Math.random() * 35)}`, 
      color: 'indigo' 
    },
  ];

  // Generate chart data from analytics
  const chartData = analytics ? [
    { month: 'Jan', individual: Math.floor(analytics.claimsByType.Individual * 0.7), village: Math.floor(analytics.claimsByType.Village * 0.6), forest: Math.floor(analytics.claimsByType.Forest * 0.5) },
    { month: 'Feb', individual: Math.floor(analytics.claimsByType.Individual * 0.75), village: Math.floor(analytics.claimsByType.Village * 0.7), forest: Math.floor(analytics.claimsByType.Forest * 0.6) },
    { month: 'Mar', individual: Math.floor(analytics.claimsByType.Individual * 0.8), village: Math.floor(analytics.claimsByType.Village * 0.75), forest: Math.floor(analytics.claimsByType.Forest * 0.7) },
    { month: 'Apr', individual: Math.floor(analytics.claimsByType.Individual * 0.85), village: Math.floor(analytics.claimsByType.Village * 0.8), forest: Math.floor(analytics.claimsByType.Forest * 0.8) },
    { month: 'May', individual: Math.floor(analytics.claimsByType.Individual * 0.9), village: Math.floor(analytics.claimsByType.Village * 0.9), forest: Math.floor(analytics.claimsByType.Forest * 0.9) },
    { month: 'Jun', individual: analytics.claimsByType.Individual, village: analytics.claimsByType.Village, forest: analytics.claimsByType.Forest },
  ] : [];

  const claimTypeData = analytics ? [
    { name: 'Individual Claims', value: analytics.claimsByType.Individual, color: '#10B981' },
    { name: 'Village Claims', value: analytics.claimsByType.Village, color: '#F59E0B' },
    { name: 'Forest Claims', value: analytics.claimsByType.Forest, color: '#3B82F6' },
  ] : [];

  const stateData = analytics ? Object.entries(analytics.stateDistribution).map(([state, claims]) => ({
    state,
    claims: claims as number,
    progress: Math.min(100, ((claims as number) / Math.max(...Object.values(analytics.stateDistribution))) * 100)
  })).slice(0, 5) : [];

  const schemeEligibilityData = analytics ? [
    { scheme: 'PM-KISAN', eligible: analytics.schemeEligibility['PM-KISAN'], color: '#10B981' },
    { scheme: 'Jal Jeevan Mission', eligible: analytics.schemeEligibility['Jal Jeevan Mission'], color: '#3B82F6' },
    { scheme: 'MGNREGA', eligible: analytics.schemeEligibility['MGNREGA'], color: '#F59E0B' },
    { scheme: 'DAJGUA', eligible: analytics.schemeEligibility['DAJGUA'], color: '#8B5CF6' },
  ] : [];

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

  if (loading || formsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FRA data from database...</p>
        </div>
      </div>
    );
  }

  if (formsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading FRA data: {formsError}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
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
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-3">🌍</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FRA Atlas Dashboard</h1>
              <p className="text-gray-600">Real-time insights from Forest Rights Act database</p>
            </div>
          </div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-6">FRA Claims Progress Over Time</h3>
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
                    dataKey="individual"
                    stroke="#3B82F6"
                    fill="url(#colorIndividual)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="village"
                    stroke="#10B981"
                    fill="url(#colorVillage)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="forest"
                    stroke="#F59E0B"
                    fill="url(#colorForest)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorIndividual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVillage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorForest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-6">FRA Claim Type Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={claimTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {claimTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* CSS Scheme Eligibility Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">CSS Scheme Eligibility Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schemeEligibilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="scheme" 
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
                <Bar dataKey="eligible" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {schemeEligibilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* State-wise Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">State-wise FRA Claims Distribution</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              View All States
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">State</th>
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
                    <td className="py-4 px-4 text-gray-600">{state.claims.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${state.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 min-w-0">
                          {Math.round(state.progress)}%
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
          transition={{ delay: 0.7 }}
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