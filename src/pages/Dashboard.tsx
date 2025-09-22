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
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
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
    }
  }, [formsLoading, formsError, getAnalytics, getAllRecommendations]);

  // Static overview stats without changing numbers
  const overviewStats = [
    { 
      icon: DocumentTextIcon, 
      label: 'FRA Claims', 
      value: analytics?.claimsByType?.Total || 0,
      color: 'blue' 
    },
    { 
      icon: UserGroupIcon, 
      label: 'Individual Claims', 
      value: analytics?.claimsByType?.Individual || 0,
      color: 'green' 
    },
    { 
      icon: BuildingOfficeIcon, 
      label: 'Village Claims', 
      value: analytics?.claimsByType?.Village || 0,
      color: 'purple' 
    },
    { 
      icon: MapPinIcon, 
      label: 'Forest Claims', 
      value: analytics?.claimsByType?.Forest || 0,
      color: 'orange' 
    }
  ];

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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (formsLoading) {
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

        {/* Overview Stats - Fixed Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Claims Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Individual Claims */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Individual Claims</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {individualForms.slice(0, 5).map((claim, index) => (
                <div key={claim.claim_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{claim.claimant_name}</h4>
                    <p className="text-sm text-gray-600">ID: {claim.claim_id}</p>
                    <p className="text-xs text-gray-500">
                      {claim.village && `${claim.village}, `}
                      {claim.district && `${claim.district}, `}
                      {claim.state}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {claim.area && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {claim.area} acres
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                      <span className="ml-1">{claim.status || 'Unknown'}</span>
                    </span>
                  </div>
                </div>
              ))}
              {individualForms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No individual claims found</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Village Claims */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Village Claims</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {villageForms.slice(0, 5).map((claim, index) => (
                <div key={claim.claim_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{claim.claimant_name}</h4>
                    <p className="text-sm text-gray-600">ID: {claim.claim_id}</p>
                    <p className="text-xs text-gray-500">
                      {claim.village && `${claim.village}, `}
                      {claim.district && `${claim.district}, `}
                      {claim.state}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {claim.resources_rights && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Resources
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                      <span className="ml-1">{claim.status || 'Unknown'}</span>
                    </span>
                  </div>
                </div>
              ))}
              {villageForms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No village claims found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Forest Claims and Scheme Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Forest Claims */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Forest Claims</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {forestForms.slice(0, 5).map((claim, index) => (
                <div key={claim.claim_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{claim.claimant_name}</h4>
                    <p className="text-sm text-gray-600">ID: {claim.claim_id}</p>
                    <p className="text-xs text-gray-500">
                      {claim.forest && `${claim.forest}, `}
                      {claim.district && `${claim.district}, `}
                      {claim.state}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {claim.resource && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {claim.resource.substring(0, 10)}...
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                      <span className="ml-1">{claim.status || 'Unknown'}</span>
                    </span>
                  </div>
                </div>
              ))}
              {forestForms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPinIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No forest claims found</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* CSS Scheme Eligibility Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">CSS Scheme Eligibility Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    P
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">PM-KISAN</h4>
                    <p className="text-sm text-gray-600">Agricultural support scheme</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{analytics?.schemeEligibility?.['PM-KISAN'] || 0}</div>
                  <div className="text-xs text-gray-500">eligible</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    J
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Jal Jeevan Mission</h4>
                    <p className="text-sm text-gray-600">Water supply scheme</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{analytics?.schemeEligibility?.['Jal Jeevan Mission'] || 0}</div>
                  <div className="text-xs text-gray-500">eligible</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    M
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">MGNREGA</h4>
                    <p className="text-sm text-gray-600">Employment guarantee scheme</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">{analytics?.schemeEligibility?.['MGNREGA'] || 0}</div>
                  <div className="text-xs text-gray-500">eligible</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                    D
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">DAJGUA</h4>
                    <p className="text-sm text-gray-600">Tribal development scheme</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{analytics?.schemeEligibility?.['DAJGUA'] || 0}</div>
                  <div className="text-xs text-gray-500">eligible</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* State-wise Distribution Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">State-wise FRA Claims Distribution</h3>
            <div className="text-sm text-gray-600">
              {Object.keys(analytics?.stateDistribution || {}).length} states
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">State</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Claims</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Individual</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Village</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Forest</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics?.stateDistribution || {}).map(([state, total], index) => {
                  const individualCount = individualForms.filter(f => f.state === state).length;
                  const villageCount = villageForms.filter(f => f.state === state).length;
                  const forestCount = forestForms.filter(f => f.state === state).length;
                  
                  return (
                    <tr key={state} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{state}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-lg font-semibold text-gray-900">{total as number}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {individualCount}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {villageCount}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                          {forestCount}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {Object.keys(analytics?.stateDistribution || {}).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No state data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <button 
            onClick={() => window.location.href = '/maps'}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <MapIcon className="h-6 w-6 mb-2 mx-auto" />
            <div className="text-sm font-medium">Open WebGIS</div>
          </button>
          <button 
            onClick={() => window.location.href = '/analytics'}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ChartBarIcon className="h-6 w-6 mb-2 mx-auto" />
            <div className="text-sm font-medium">View Analytics</div>
          </button>
          <button 
            onClick={() => window.location.href = '/dss'}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <DocumentTextIcon className="h-6 w-6 mb-2 mx-auto" />
            <div className="text-sm font-medium">Decision Support</div>
          </button>
          <button 
            onClick={() => window.location.href = '/upload'}
            className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FolderIcon className="h-6 w-6 mb-2 mx-auto" />
            <div className="text-sm font-medium">Upload Files</div>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;