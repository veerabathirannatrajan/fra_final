import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFRAForms } from '../hooks/useFRAForms';
import { 
  ChartBarIcon, 
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  DocumentCheckIcon,
  UserGroupIcon,
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const Analytics: React.FC = () => {
  const { 
    loading: formsLoading, 
    error: formsError, 
    getAllRecommendations, 
    getAnalytics,
    individualForms,
    villageForms,
    forestForms
  } = useFRAForms();
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('parcels');
  const [activeTab, setActiveTab] = useState('overview');

  // Get FRA analytics data
  const fraAnalytics = getAnalytics();
  const recommendations = getAllRecommendations();

  // Mock analytics data
  const timeSeriesData = [
    { month: 'Jan', parcels: 3200, area: 12500, files: 145 },
    { month: 'Feb', parcels: 3350, area: 13200, files: 189 },
    { month: 'Mar', parcels: 3500, area: 14100, files: 234 },
    { month: 'Apr', parcels: 3650, area: 14800, files: 287 },
    { month: 'May', parcels: 3800, area: 15200, files: 334 },
    { month: 'Jun', parcels: 4000, area: 15650, files: 398 },
  ];

  const stateComparisonData = [
    { state: 'Odisha', parcels: 1600, area: 6250, completion: 92 },
    { state: 'Jharkhand', parcels: 1000, area: 3890, completion: 87 },
    { state: 'Chhattisgarh', parcels: 800, area: 3120, completion: 78 },
    { state: 'West Bengal', parcels: 400, area: 1560, completion: 85 },
    { state: 'Andhra Pradesh', parcels: 200, area: 830, completion: 90 },
  ];

  const landTypeDistribution = [
    { type: 'Forest Land', value: 45, area: 7043, color: '#10B981' },
    { type: 'Agricultural', value: 30, area: 4695, color: '#F59E0B' },
    { type: 'Residential', value: 15, area: 2348, color: '#3B82F6' },
    { type: 'Commercial', value: 10, area: 1565, color: '#8B5CF6' },
  ];

  const efficiencyMetrics = [
    { metric: 'Documentation Speed', value: 85, fullMark: 100 },
    { metric: 'Data Accuracy', value: 92, fullMark: 100 },
    { metric: 'Coverage Completeness', value: 78, fullMark: 100 },
    { metric: 'File Processing', value: 88, fullMark: 100 },
    { metric: 'User Satisfaction', value: 94, fullMark: 100 },
  ];

  const trendsData = [
    { month: 'Jan', documentation: 78, disputes: 12, approvals: 156 },
    { month: 'Feb', documentation: 82, disputes: 8, approvals: 189 },
    { month: 'Mar', documentation: 85, disputes: 15, approvals: 201 },
    { month: 'Apr', documentation: 89, disputes: 6, approvals: 234 },
    { month: 'May', documentation: 87, disputes: 11, approvals: 267 },
    { month: 'Jun', documentation: 92, disputes: 4, approvals: 298 },
  ];

  const exportData = () => {
    // Mock export functionality
    alert('Analytics data exported successfully!');
  };

  // Convert FRA analytics to chart data
  const claimTypeData = [
    { name: 'Individual Claims', value: fraAnalytics.claimsByType.Individual, color: '#3B82F6' },
    { name: 'Village Claims', value: fraAnalytics.claimsByType.Village, color: '#10B981' },
    { name: 'Forest Claims', value: fraAnalytics.claimsByType.Forest, color: '#F59E0B' },
  ];

  const schemeEligibilityData = [
    { scheme: 'PM-KISAN', eligible: fraAnalytics.schemeEligibility['PM-KISAN'] },
    { scheme: 'Jal Jeevan Mission', eligible: fraAnalytics.schemeEligibility['Jal Jeevan Mission'] },
    { scheme: 'MGNREGA', eligible: fraAnalytics.schemeEligibility['MGNREGA'] },
    { scheme: 'DAJGUA', eligible: fraAnalytics.schemeEligibility['DAJGUA'] },
  ];

  const stateWiseData = Object.entries(fraAnalytics.stateDistribution).map(([state, count]) => ({
    state,
    claims: count
  }));

  const statusData = Object.entries(fraAnalytics.statusSummary).map(([status, count]) => ({
    name: status,
    value: count,
    color: status === 'Approved' ? '#10B981' : status === 'Pending' ? '#F59E0B' : '#EF4444'
  }));

  if (formsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">FRA Eligibility & Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights on FRA claims and CSS scheme eligibility recommendations</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('eligibility')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'eligibility' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Eligibility
                </button>
              </div>
              <button
                onClick={exportData}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* FRA Claims Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <DocumentCheckIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{fraAnalytics.claimsByType.Total}</div>
            <div className="text-sm text-gray-600">Total FRA Claims</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{fraAnalytics.claimsByType.Individual}</div>
            <div className="text-sm text-gray-600">Individual Claims</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{fraAnalytics.claimsByType.Village}</div>
            <div className="text-sm text-gray-600">Village Claims</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{fraAnalytics.claimsByType.Forest}</div>
            <div className="text-sm text-gray-600">Forest Claims</div>
          </div>
        </motion.div>

        {activeTab === 'overview' && (
          <>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Individual Claims Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Individual Claims Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Approved', value: individualForms.filter(f => f.status === 'Approved').length, color: '#10B981' },
                          { name: 'Pending', value: individualForms.filter(f => !f.status || f.status === 'Pending').length, color: '#F59E0B' },
                          { name: 'Rejected', value: individualForms.filter(f => f.status === 'Rejected').length, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Approved', value: individualForms.filter(f => f.status === 'Approved').length, color: '#10B981' },
                          { name: 'Pending', value: individualForms.filter(f => !f.status || f.status === 'Pending').length, color: '#F59E0B' },
                          { name: 'Rejected', value: individualForms.filter(f => f.status === 'Rejected').length, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Village Claims Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Village Claims Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Approved', value: villageForms.filter(f => f.status === 'Approved').length, color: '#10B981' },
                          { name: 'Pending', value: villageForms.filter(f => !f.status || f.status === 'Pending').length, color: '#F59E0B' },
                          { name: 'Rejected', value: villageForms.filter(f => f.status === 'Rejected').length, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Approved', value: villageForms.filter(f => f.status === 'Approved').length, color: '#10B981' },
                          { name: 'Pending', value: villageForms.filter(f => !f.status || f.status === 'Pending').length, color: '#F59E0B' },
                          { name: 'Rejected', value: villageForms.filter(f => f.status === 'Rejected').length, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Forest Claims Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Forest Claims Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Approved', value: forestForms.filter(f => f.status === 'Approved').length, color: '#10B981' },
                          { name: 'Pending', value: forestForms.filter(f => !f.status || f.status === 'Pending').length, color: '#F59E0B' },
                          { name: 'Rejected', value: forestForms.filter(f => f.status === 'Rejected').length, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: 'Approved', value: forestForms.filter(f => f.status === 'Approved').length, color: '#10B981' },
                          { name: 'Pending', value: forestForms.filter(f => !f.status || f.status === 'Pending').length, color: '#F59E0B' },
                          { name: 'Rejected', value: forestForms.filter(f => f.status === 'Rejected').length, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Scheme Eligibility */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">CSS Scheme Eligibility</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={schemeEligibilityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="scheme" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
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
                      <Bar dataKey="eligible" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Monthly Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Claim Trends</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendsData}>
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
                      <Line type="monotone" dataKey="documentation" stroke="#3B82F6" strokeWidth={3} />
                      <Line type="monotone" dataKey="approvals" stroke="#10B981" strokeWidth={3} />
                      <Line type="monotone" dataKey="disputes" stroke="#EF4444" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {activeTab === 'eligibility' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">FRA Claim Eligibility Recommendations</h3>
                  <div className="text-sm text-gray-600">
                    {recommendations.length} claims analyzed
                  </div>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="divide-y divide-gray-100">
                  {recommendations.slice(0, 20).map((rec, index) => (
                    <div key={rec.claim_id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">{rec.claimant_name}</h4>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {rec.claim_type}
                            </span>
                            <span className="text-xs text-gray-500">ID: {rec.claim_id}</span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-3">
                            {rec.village && `${rec.village}, `}{rec.district && `${rec.district}, `}{rec.state}
                            {rec.status && (
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                rec.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                rec.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {rec.status}
                              </span>
                            )}
                          </div>

                          {rec.recommended_schemes.length > 0 ? (
                            <div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {rec.recommended_schemes.map((scheme, idx) => (
                                  <span key={idx} className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800">
                                    {scheme}
                                  </span>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500">
                                {rec.eligibility_reasons.join(' • ')}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              No eligible schemes found
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {recommendations.length > 20 && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View All {recommendations.length} Recommendations
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;