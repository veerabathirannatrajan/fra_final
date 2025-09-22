import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageCarousel from '../components/Landing/ImageCarousel';
import { 
  MapIcon, 
  ChartBarIcon, 
  CloudArrowUpIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  GlobeAsiaAustraliaIcon
} from '@heroicons/react/24/outline';

const Landing: React.FC = () => {
  const features = [
    {
      icon: MapIcon,
      title: 'FRA Atlas WebGIS',
      description: 'Interactive mapping of IFR, CR, and CFR areas with satellite imagery, village boundaries, and real-time FRA progress tracking.'
    },
    {
      icon: ChartBarIcon,
      title: 'AI-Powered Asset Mapping',
      description: 'Computer vision and ML models to detect agricultural land, forest cover, water bodies, and homesteads from satellite imagery.'
    },
    {
      icon: CloudArrowUpIcon,
      title: 'Digital FRA Archive',
      description: 'AI-processed digitization of legacy FRA claims, verifications, and pattas with OCR and Named Entity Recognition.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Decision Support System',
      description: 'Rule-based AI engine for CSS scheme layering, eligibility matching, and targeted development interventions.'
    },
    {
      icon: UserGroupIcon,
      title: 'Multi-Ministry Integration',
      description: 'Seamless integration with DAJGUA schemes (PM-KISAN, Jal Jeevan Mission, MGNREGA) for FRA patta holders.'
    },
    {
      icon: GlobeAsiaAustraliaIcon,
      title: 'Real-time Monitoring',
      description: 'Satellite-based monitoring of CFR forests with IoT integration potential for soil health and water quality.'
    }
  ];

  const stats = [
    { label: 'FRA Claims Digitized', value: '1K+' },
    { label: 'Villages Mapped', value: '200+' },
    { label: 'Pattas Processed', value: '1K+' },
    { label: 'Asset Maps Generated', value: '200+' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🌍</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                FRA Atlas
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent">
                FRA Atlas
              </span><br />
              Forest Rights Act Management System
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Comprehensive digital platform for managing Individual Forest Rights (IFR), Community Rights (CR), 
              and Community Forest Resource Rights (CFR) with AI-powered asset mapping and decision support.
            </p>
          </motion.div>

          {/* Image Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <ImageCarousel />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              AI-Powered FRA Management Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive solution for Forest Rights Act implementation with satellite mapping, 
              legacy data digitization, and intelligent decision support for targeted development.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Transform Forest Rights Management with FRA Atlas
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Comprehensive forest rights documentation and AI-powered decision support 
              for Ministry of Tribal Affairs and district departments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg"
              >
                Access FRA Atlas
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-2xl">🌍</span>
              <span className="text-xl font-semibold">FRA Atlas</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 FRA Atlas. Built for Forest Rights Act implementation and tribal community empowerment.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;