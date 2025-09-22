import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFRAForms } from '../hooks/useFRAForms';
import { supabase } from '../lib/supabase';
import { 
  CpuChipIcon, 
  LightBulbIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DSS: React.FC = () => {
  const { individualForms, villageForms, forestForms, loading, error, refetch } = useFRAForms();
  const [selectedClaimType, setSelectedClaimType] = useState<'individual' | 'village' | 'forest'>('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Get current data based on selected type
  const getCurrentData = () => {
    switch (selectedClaimType) {
      case 'individual':
        return individualForms;
      case 'village':
        return villageForms;
      case 'forest':
        return forestForms;
      default:
        return [];
    }
  };

  // Filter data based on search term and status
  const getFilteredData = () => {
    const data = getCurrentData();
    let filtered = data;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.claimant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.claim_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status based on active tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(item => 
        !item.status || item.status.toLowerCase() === 'pending' || item.status.toLowerCase() === 'unknown'
      );
    } else {
      filtered = filtered.filter(item => 
        item.status && (item.status.toLowerCase() === 'approved' || item.status.toLowerCase() === 'rejected')
      );
    }

    return filtered;
  };

  // Update claim status in database
  const updateClaimStatus = async (claimId: string, newStatus: 'Approved' | 'Rejected') => {
    setUpdatingStatus(claimId);
    
    try {
      let tableName = '';
      switch (selectedClaimType) {
        case 'individual':
          tableName = 'individual_forms';
          break;
        case 'village':
          tableName = 'village_form';
          break;
        case 'forest':
          tableName = 'forest_form';
          break;
      }

      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq('claim_id', claimId);

      if (error) throw error;

      // Refresh data
      await refetch();
      
      // Update selected claim if it's the one being updated
      if (selectedClaim?.claim_id === claimId) {
        setSelectedClaim({ ...selectedClaim, status: newStatus });
      }

      // Show success message
      alert(`Claim ${claimId} has been ${newStatus.toLowerCase()} successfully!`);
      
    } catch (error) {
      console.error('Error updating claim status:', error);
      alert(`Failed to update claim status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Enhanced eligibility checking with unique reasons
  const checkEligibilityWithReasons = (claim: any, type: string) => {
    const schemes = [];

    if (type === 'individual') {
      // PM-KISAN eligibility with detailed reasoning
      if (claim.area && claim.area > 1.0 && claim.income && claim.income <= 200000) {
        schemes.push({
          name: 'PM-KISAN',
          priority: 1,
          reason: `Eligible for PM-KISAN as you own ${claim.area} acres of cultivable land (requirement: >1.0 acre) and your annual income of ₹${claim.income?.toLocaleString()} is within the limit of ₹2,00,000. This scheme provides ₹6,000 per year in three installments directly to your bank account.`,
          benefits: '₹6,000 annual income support, Direct bank transfer, No middleman involvement'
        });
      }

      // Jal Jeevan Mission eligibility
      if (claim.status === 'Pending' || !claim.forest_near || claim.forest_near.toLowerCase().includes('water')) {
        schemes.push({
          name: 'Jal Jeevan Mission',
          priority: 2,
          reason: `Recommended for Jal Jeevan Mission based on your current status (${claim.status}) indicating potential lack of proper water connection. This mission ensures 'Har Ghar Jal' - functional household tap connection to every rural household.`,
          benefits: 'Piped water supply, 55 liters per person per day, Quality assured water'
        });
      }

      // MGNREGA eligibility
      if (claim.income && claim.income <= 120000) {
        schemes.push({
          name: 'MGNREGA',
          priority: 3,
          reason: `Eligible for MGNREGA as your annual income of ₹${claim.income?.toLocaleString()} is below ₹1,20,000, indicating need for additional livelihood support. This scheme guarantees 100 days of wage employment per household per year.`,
          benefits: '100 days guaranteed employment, ₹309 per day wage (varies by state), Asset creation in village'
        });
      }
    }

    if (type === 'village') {
      // Jal Jeevan Mission for villages
      if (claim.resources_rights && claim.resources_rights.toLowerCase().includes('water')) {
        schemes.push({
          name: 'Jal Jeevan Mission',
          priority: 1,
          reason: `Your village has established water resource rights (${claim.resources_rights}), making it ideal for Jal Jeevan Mission implementation. This will ensure piped water supply to all households in ${claim.village} village.`,
          benefits: 'Village-wide piped water supply, Community water management, Improved health outcomes'
        });
      }

      // MGNREGA for village development
      if (claim.status === 'Pending' || claim.status === 'Unemployed') {
        schemes.push({
          name: 'MGNREGA',
          priority: 2,
          reason: `Village status shows ${claim.status}, indicating need for employment generation and rural development. MGNREGA can create sustainable livelihood opportunities while building village infrastructure.`,
          benefits: 'Village infrastructure development, Employment generation, Skill development'
        });
      }

      // DAJGUA for village development
      schemes.push({
        name: 'DAJGUA',
        priority: 3,
        reason: `As a village-level claimant in ${claim.district} district, your community can benefit from DAJGUA schemes for integrated tribal development, focusing on education, health, and livelihood enhancement.`,
        benefits: 'Integrated development approach, Education & health facilities, Livelihood enhancement'
      });
    }

    if (type === 'forest') {
      // DAJGUA for forest communities
      if (claim.status === 'Approved') {
        schemes.push({
          name: 'DAJGUA',
          priority: 1,
          reason: `Your forest rights claim is approved (Status: ${claim.status}) for ${claim.forest} forest area. DAJGUA provides comprehensive support for forest-dependent communities with focus on sustainable forest management and livelihood diversification.`,
          benefits: 'Forest conservation support, Alternative livelihood options, Community development'
        });
      }

      // Jal Jeevan Mission for forest communities
      if (claim.resource && claim.resource.toLowerCase().includes('water')) {
        schemes.push({
          name: 'Jal Jeevan Mission',
          priority: 2,
          reason: `Your community has rights over water resources (${claim.resource}) in the forest area. Jal Jeevan Mission can provide sustainable water supply solutions for forest-dependent communities.`,
          benefits: 'Sustainable water supply, Community-managed systems, Forest conservation alignment'
        });
      }

      // MGNREGA for forest area development
      schemes.push({
        name: 'MGNREGA',
        priority: 3,
        reason: `Forest communities often need additional livelihood support. MGNREGA can provide employment in forest conservation activities, watershed management, and eco-restoration work in ${claim.forest} area.`,
        benefits: 'Forest conservation employment, Watershed development, Eco-restoration work'
      });
    }

    // Sort by priority and return top recommendation
    schemes.sort((a, b) => a.priority - b.priority);
    return schemes.length > 0 ? schemes[0] : null;
  };

  const claimTypes = [
    { id: 'individual', name: 'Individual Claims', icon: UserIcon, count: individualForms.length },
    { id: 'village', name: 'Village Claims', icon: BuildingOfficeIcon, count: villageForms.length },
    { id: 'forest', name: 'Forest Claims', icon: MapIcon, count: forestForms.length },
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircleIcon className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FRA claims data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading data: {error}</div>
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
            <CpuChipIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FRA Decision Support System</h1>
              <p className="text-gray-600 mt-1">Government Officer Portal - CSS scheme recommendations and claim approval</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Claim Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Claim Type Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Claim Type</h3>
              <div className="space-y-3">
                {claimTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedClaimType(type.id as any);
                        setSelectedClaim(null);
                        setSearchTerm('');
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedClaimType === type.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className={`h-5 w-5 mr-3 ${
                          selectedClaimType === type.id ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                        <span className={`font-medium ${
                          selectedClaimType === type.id ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {type.name}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedClaimType === type.id 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {type.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Claims</h3>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'pending' 
                        ? 'bg-yellow-500 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ClockIcon className="h-4 w-4 inline mr-2" />
                    Pending ({getFilteredData().length})
                  </button>
                  <button
                    onClick={() => setActiveTab('approved')}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'approved' 
                        ? 'bg-green-500 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                    Processed ({getFilteredData().length})
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {getFilteredData().length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-gray-300 mb-2">No {activeTab} claims found</div>
                    <div className="text-sm">Try adjusting your search terms</div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {getFilteredData().map((claim, index) => (
                      <button
                        key={claim.claim_id}
                        onClick={() => setSelectedClaim(claim)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedClaim?.claim_id === claim.claim_id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{claim.claimant_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">ID: {claim.claim_id}</p>
                            <p className="text-sm text-gray-500">
                              {claim.village && `${claim.village}, `}
                              {claim.district && `${claim.district}, `}
                              {claim.state}
                            </p>
                          </div>
                          <div className="ml-3 flex flex-col items-end space-y-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(claim.status)}`}>
                              {getStatusIcon(claim.status)}
                              <span className="ml-1">{claim.status || 'Pending'}</span>
                            </span>
                            
                            {/* Approval/Rejection buttons for pending claims */}
                            {activeTab === 'pending' && (claim.status?.toLowerCase() === 'pending' || !claim.status) && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateClaimStatus(claim.claim_id, 'Approved');
                                  }}
                                  disabled={updatingStatus === claim.claim_id}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                  title="Approve Claim"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateClaimStatus(claim.claim_id, 'Rejected');
                                  }}
                                  disabled={updatingStatus === claim.claim_id}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                  title="Reject Claim"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Recommendation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {selectedClaim ? (
              <div className="space-y-6">
                {/* Claim Details */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Claim Details</h3>
                    {activeTab === 'pending' && (selectedClaim.status?.toLowerCase() === 'pending' || !selectedClaim.status) && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateClaimStatus(selectedClaim.claim_id, 'Approved')}
                          disabled={updatingStatus === selectedClaim.claim_id}
                          className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <ShieldCheckIcon className="h-4 w-4 mr-2" />
                          {updatingStatus === selectedClaim.claim_id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => updateClaimStatus(selectedClaim.claim_id, 'Rejected')}
                          disabled={updatingStatus === selectedClaim.claim_id}
                          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          {updatingStatus === selectedClaim.claim_id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Claimant Name</label>
                      <p className="text-gray-900 font-medium">{selectedClaim.claimant_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Claim ID</label>
                      <p className="text-gray-900 font-medium">{selectedClaim.claim_id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Village</label>
                      <p className="text-gray-900">{selectedClaim.village || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">District</label>
                      <p className="text-gray-900">{selectedClaim.district || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">State</label>
                      <p className="text-gray-900">{selectedClaim.state || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedClaim.status)}`}>
                        {getStatusIcon(selectedClaim.status)}
                        <span className="ml-1">{selectedClaim.status || 'Pending'}</span>
                      </span>
                    </div>
                    {selectedClaim.area && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Land Area</label>
                        <p className="text-gray-900">{selectedClaim.area} acres</p>
                      </div>
                    )}
                    {selectedClaim.income && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Annual Income</label>
                        <p className="text-gray-900">₹{selectedClaim.income.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scheme Recommendation */}
                {(() => {
                  const recommendation = checkEligibilityWithReasons(selectedClaim, selectedClaimType);
                  
                  if (!recommendation) {
                    return (
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="text-center py-8">
                          <XCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Eligible Schemes Found</h3>
                          <p className="text-gray-600">
                            Based on the current claim details, no CSS schemes match the eligibility criteria. 
                            Please verify the claim information or contact the local administration for guidance.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center mb-6">
                        <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Recommended CSS Scheme</h3>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                            {recommendation.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-blue-900">{recommendation.name}</h4>
                            <p className="text-blue-700 text-sm">Primary Recommendation</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">Eligibility Reason</h5>
                            <p className="text-gray-700 leading-relaxed">{recommendation.reason}</p>
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-900 mb-2">Key Benefits</h5>
                            <p className="text-gray-700">{recommendation.benefits}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-center py-12">
                  <CpuChipIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Claim for Analysis</h3>
                  <p className="text-gray-600">
                    Choose a claim from the left panel to get personalized CSS scheme recommendations and approval options
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DSS;