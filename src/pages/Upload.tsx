import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import OCRProcessor from '../lib/ocrProcessor';
import { useFRAForms } from '../hooks/useFRAForms';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon,
  FolderIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
  category: string;
  extractedData?: any;
  tableName?: string;
  claimId?: string;
}

const Upload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('auto');
  const { refetch, getAnalytics } = useFRAForms();

  // Get current analytics for statistics
  const analytics = getAnalytics();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      alert('Please configure Google Vision API key in environment variables');
      return;
    }

    setProcessing(true);
    const processor = new OCRProcessor(apiKey);

    for (const file of files) {
      // Validate file type
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        alert(`File ${file.name} is not a PDF. Only PDF files are supported.`);
        continue;
      }

      // Create initial file entry
      const fileEntry: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: formatFileSize(file.size),
        type: 'PDF',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'processing',
        category: 'FRA Document'
      };

      setUploadedFiles(prev => [fileEntry, ...prev]);

      try {
        // Process the document
        const result = await processor.processDocument(file);

        if (result.success && result.extracted_data && result.table_name) {
          // Insert into database
          const { data, error } = await supabase
            .from(result.table_name)
            .insert(result.extracted_data)
            .select()
            .single();

          if (error) {
            throw new Error(`Database error: ${error.message}`);
          }

          // Update file entry with success
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileEntry.id 
              ? {
                  ...f,
                  status: 'completed' as const,
                  extractedData: result.extracted_data,
                  tableName: result.table_name,
                  claimId: data?.claim_id || 'Generated'
                }
              : f
          ));

          // Refresh the FRA forms data
          refetch();

        } else {
          throw new Error(result.error || 'Processing failed');
        }

      } catch (error) {
        console.error('File processing error:', error);
        
        // Update file entry with error
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileEntry.id 
            ? { ...f, status: 'error' as const }
            : f
        ));
      }
    }

    setProcessing(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-yellow-600 animate-spin" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'processing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FRA Document Processing</h1>
          <p className="text-gray-600">Upload FRA documents for automatic OCR processing and database insertion</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Drag and Drop Upload */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Upload FRA Documents
              </h2>
              
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={processing}
                />
                
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {dragActive ? 'Drop PDF files here' : 'Drag and drop PDF files here'}
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse from your computer
                </p>
                <div className="text-sm text-gray-500">
                  Supported formats: PDF only (Max 50MB per file)
                </div>
                
                {processing && (
                  <div className="mt-4 flex items-center justify-center text-blue-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                    Processing documents...
                  </div>
                )}
              </div>
            </div>

            {/* Processing Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Pipeline</h3>
              
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">1</div>
                  <div>
                    <div className="font-medium text-gray-900">OCR Text Extraction</div>
                    <div className="text-sm text-gray-600">Extract text from PDF using Google Vision API</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">2</div>
                  <div>
                    <div className="font-medium text-gray-900">Language Translation</div>
                    <div className="text-sm text-gray-600">Translate content to English using Google Translate</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">3</div>
                  <div>
                    <div className="font-medium text-gray-900">Form Recognition & NER</div>
                    <div className="text-sm text-gray-600">Identify form type and extract structured data</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">4</div>
                  <div>
                    <div className="font-medium text-gray-900">Database Insertion</div>
                    <div className="text-sm text-gray-600">Insert processed data into appropriate FRA table</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics and Recent Files */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Upload Statistics */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">FRA Database Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analytics.claimsByType.Individual}</div>
                  <div className="text-sm text-gray-600">Individual Claims</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{analytics.claimsByType.Village}</div>
                  <div className="text-sm text-gray-600">Village Claims</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{analytics.claimsByType.Forest}</div>
                  <div className="text-sm text-gray-600">Forest Claims</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{analytics.claimsByType.Total}</div>
                  <div className="text-sm text-gray-600">Total Claims</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Scheme Eligibility:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>PM-KISAN: <span className="font-medium">{analytics.schemeEligibility['PM-KISAN']}</span></div>
                  <div>Jal Jeevan: <span className="font-medium">{analytics.schemeEligibility['Jal Jeevan Mission']}</span></div>
                  <div>MGNREGA: <span className="font-medium">{analytics.schemeEligibility['MGNREGA']}</span></div>
                  <div>DAJGUA: <span className="font-medium">{analytics.schemeEligibility['DAJGUA']}</span></div>
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FolderIcon className="h-5 w-5 mr-2" />
                    Recent Uploads
                  </h3>
                  <div className="text-sm text-gray-600">
                    {uploadedFiles.length} files processed
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {uploadedFiles.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No files uploaded yet</p>
                    <p className="text-sm">Upload PDF documents to get started</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {uploadedFiles.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(file.status)}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{file.name}</h4>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{file.size}</span>
                                <span>•</span>
                                <span>{file.uploadDate}</span>
                                {file.claimId && (
                                  <>
                                    <span>•</span>
                                    <span className="font-medium">ID: {file.claimId}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(file.status)}`}>
                              {file.status}
                            </span>
                            <button 
                              onClick={() => removeFile(file.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {file.extractedData && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-600 mb-1">Extracted Data:</div>
                            <div className="text-xs space-y-1">
                              {file.extractedData.claimant_name && (
                                <div><span className="font-medium">Name:</span> {file.extractedData.claimant_name}</div>
                              )}
                              {file.extractedData.village && (
                                <div><span className="font-medium">Village:</span> {file.extractedData.village}</div>
                              )}
                              {file.extractedData.district && (
                                <div><span className="font-medium">District:</span> {file.extractedData.district}</div>
                              )}
                              {file.tableName && (
                                <div><span className="font-medium">Form Type:</span> {file.tableName.replace('_', ' ').toUpperCase()}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Upload;