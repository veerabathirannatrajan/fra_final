import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CpuChipIcon, 
  LightBulbIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalculatorIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const DSS: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState('resource-allocation');
  const [analysisType, setAnalysisType] = useState('optimization');
  const [timeHorizon, setTimeHorizon] = useState('1year');

  // Mock DSS data
  const resourceAllocationData = [
    { resource: 'Education', current: 25, optimal: 35, gap: -10 },
    { resource: 'Healthcare', current: 20, optimal: 28, gap: -8 },
    { resource: 'Infrastructure', current: 30, optimal: 25, gap: 5 },
    { resource: 'Agriculture', current: 15, optimal: 20, gap: -5 },
    { resource: 'Forest Conservation', current: 10, optimal: 15, gap: -5 },
  ];

  const impactAnalysisData = [
    { factor: 'Economic Impact', current: 65, projected: 85, target: 90 },
    { factor: 'Social Welfare', current: 70, projected: 82, target: 95 },
    { factor: 'Environmental', current: 55, projected: 75, target: 80 },
    { factor: 'Infrastructure', current: 60, projected: 78, target: 85 },
    { factor: 'Education Access', current: 45, projected: 70, target: 90 },
    { factor: 'Healthcare Access', current: 50, projected: 68, target: 85 },
  ];

  const budgetOptimizationData = [
    { month: 'Q1', allocated: 2500, utilized: 2200, efficiency: 88 },
    { month: 'Q2', allocated: 3000, utilized: 2850, efficiency: 95 },
    { month: 'Q3', allocated: 2800, utilized: 2520, efficiency: 90 },
    { month: 'Q4', allocated: 3200, utilized: 3040, efficiency: 95 },
  ];

  const riskAssessmentData = [
    { category: 'Land Disputes', probability: 25, impact: 70, risk: 'Medium' },
    { category: 'Environmental Degradation', probability: 40, impact: 85, risk: 'High' },
    { category: 'Budget Constraints', probability: 60, impact: 60, risk: 'High' },
    { category: 'Policy Changes', probability: 30, impact: 50, risk: 'Low' },
    { category: 'Community Resistance', probability: 20, impact: 40, risk: 'Low' },
  ];

  const scenarios = [
    { id: 'resource-allocation', name: 'Resource Allocation Optimization', icon: CalculatorIcon },
    { id: 'impact-analysis', name: 'Policy Impact Analysis', icon: ChartBarIcon },
    { id: 'budget-planning', name: 'Budget Planning & Forecasting', icon: DocumentTextIcon },
    { id: 'risk-assessment', name: 'Risk Assessment & Mitigation', icon: LightBulbIcon },
  ];

  const recommendations = {
    'resource-allocation': [
      'Increase education budget allocation by 40% to meet optimal targets',
      'Reallocate 5% from infrastructure to healthcare for better balance',
      'Focus on forest conservation programs with additional 50% funding',
      'Implement community-based resource management strategies'
    ],
    'impact-analysis': [
      'Projected 30% improvement in economic indicators with current policies',
      'Social welfare programs show positive trend but need 25% budget increase',
      'Environmental initiatives require immediate action for target achievement',
      'Infrastructure development on track with current allocation'
    ],
    'budget-planning': [
      'Maintain current utilization efficiency above 90% across all quarters',
      'Consider seasonal budget adjustments for Q3 to improve efficiency',
      'Implement real-time budget monitoring for better resource utilization',
      'Plan for 15% budget increase in Q4 for year-end initiatives'
    ],
    'risk-assessment': [
      'High priority: Address environmental degradation risks immediately',
      'Medium priority: Develop land dispute resolution mechanisms',
      'Monitor budget constraints and develop contingency plans',
      'Engage communities early to prevent resistance to new policies'
    ]
  };

  const renderChart = () => {
    switch (selectedScenario) {
      case 'resource-allocation':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resourceAllocationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="resource" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#6B7280' }}
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
              <Bar dataKey="current" fill="#3B82F6" name="Current Allocation" radius={[4, 4, 0, 0]} />
              <Bar dataKey="optimal" fill="#10B981" name="Optimal Allocation" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'impact-analysis':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={impactAnalysisData}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="factor" 
                tick={{ fontSize: 10, fill: '#6B7280' }}
              />
              <PolarRadiusAxis 
                domain={[0, 100]} 
                tick={false} 
                axisLine={false} 
              />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Projected"
                dataKey="projected"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'budget-planning':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={budgetOptimizationData}>
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
                dataKey="allocated"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="utilized"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
    let primaryScheme = '';
              />
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskAssessmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
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
              <Bar dataKey="probability" fill="#F59E0B" name="Probability %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="impact" fill="#EF4444" name="Impact %" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

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
              <p className="text-gray-600 mt-1">AI-powered CSS scheme layering and targeted development recommendations</p>
            </div>
          </div>
        </motion.div>

        {/* Scenario Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon;
              return (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedScenario === scenario.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-6 w-6 mb-3 ${
                    selectedScenario === scenario.id ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <div className={`text-sm font-medium ${
                    selectedScenario === scenario.id ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {scenario.name}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
              <div className="flex items-center mb-6">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Analysis Parameters</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Type</label>
                  <select
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="optimization">Optimization</option>
                    <option value="forecasting">Forecasting</option>
                    <option value="scenario">Scenario Planning</option>
                    <option value="sensitivity">Sensitivity Analysis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon</label>
                  <select
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="6months">6 Months</option>
                    <option value="1year">1 Year</option>
                    <option value="2years">2 Years</option>
                    <option value="5years">5 Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Level</label>
                  <input
                    type="range"
                    min="80"
                    max="99"
                    defaultValue="95"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>80%</span>
                    <span>95%</span>
                    <span>99%</span>
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                  Run Analysis
                </button>

                <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                  Export Results
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Analysis Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Chart Area */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {scenarios.find(s => s.id === selectedScenario)?.name}
              </h3>
              <div className="h-80">
                {renderChart()}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-6">
                <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
              </div>
              
              <div className="space-y-4">
                {recommendations[selectedScenario as keyof typeof recommendations]?.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{rec}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Insights</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600">Optimization Potential</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹12.5M</div>
                  <div className="text-sm text-gray-600">Potential Savings</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">6 Mo</div>
                  <div className="text-sm text-gray-600">Implementation Time</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-yellow-800">Critical Action Required</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Environmental degradation risks require immediate attention. Consider implementing emergency conservation measures within the next 30 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DSS;