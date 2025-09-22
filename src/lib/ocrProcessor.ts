interface ProcessingResult {
  success: boolean;
  table_name?: string;
  form_title?: string;
  extracted_data?: Record<string, any>;
  database_result?: {
    success: boolean;
    message?: string;
    inserted_id?: string;
    error?: string;
  };
  error?: string;
}

interface FormMapping {
  titles: string[];
  status_mapping: Record<string, string>;
}

interface FormMappings {
  individual_forms: FormMapping;
  forest_form: FormMapping;
  village_form: FormMapping;
}

class OCRProcessor {
  private apiKey: string;
  private formMappings: FormMappings;
  private fieldPatterns: Record<string, string[]>;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    
    this.formMappings = {
      individual_forms: {
        titles: [
          'CLAIM FORM FOR RIGHTS TO FOIREST LAND',
          'CLAIM FORM FOR RIGHTS TO FOREST LAND',
          'TITLE FOR FOREST LAND UNDER OCCUPATION'
        ],
        status_mapping: {
          'CLAIM FORM FOR RIGHTS TO FOIREST LAND': 'Pending',
          'CLAIM FORM FOR RIGHTS TO FOREST LAND': 'Pending',
          'TITLE FOR FOREST LAND UNDER OCCUPATION': 'Approved'
        }
      },
      forest_form: {
        titles: [
          'CLAIM FORM FOR COMMUNITY RIGHTS',
          'TITLE TO COMMMUNITY FOREST RIGHTS',
          'TITLE TO COMMUNITY FOREST RIGHTS'
        ],
        status_mapping: {
          'CLAIM FORM FOR COMMUNITY RIGHTS': 'Pending',
          'TITLE TO COMMMUNITY FOREST RIGHTS': 'Approved',
          'TITLE TO COMMUNITY FOREST RIGHTS': 'Approved'
        }
      },
      village_form: {
        titles: [
          'CLAIM FORM FOR RIGHTS TO COMMUNITY FOREST RESOURCE',
          'TITLE TO COMMUNITY FOREST RESOURCES'
        ],
        status_mapping: {
          'CLAIM FORM FOR RIGHTS TO COMMUNITY FOREST RESOURCE': 'Pending',
          'TITLE TO COMMUNITY FOREST RESOURCES': 'Approved'
        }
      }
    };

    this.fieldPatterns = {
      claimant_name: [/claimant\s*name\s*:\s*(.+)/i, /1\)\s*claimant\s*name\s*:\s*(.+)/i],
      address: [/address\s*:\s*(.+)/i, /2\)\s*address\s*:\s*(.+)/i],
      village: [/village\s*:\s*(.+)/i, /\d+\)\s*village\s*:\s*(.+)/i],
      land_no: [/land\s*no\s*:\s*(.+)/i, /\d+\)\s*land\s*no\s*:\s*(.+)/i],
      gram_panchayat: [/gram\s*panchayat\s*:\s*(.+)/i, /\d+\)\s*gram\s*panchayat\s*:\s*(.+)/i],
      taluka: [/taluka\s*:\s*(.+)/i, /\d+\)\s*taluka\s*:\s*(.+)/i],
      district: [/district\s*:\s*(.+)/i, /\d+\)\s*district\s*:\s*(.+)/i],
      state: [/state\s*:\s*(.+)/i, /\d+\)\s*state\s*:\s*(.+)/i],
      area: [/area\s*:\s*(.+)/i, /\d+\)\s*area\s*:\s*(.+)/i],
      income: [/income\s*:\s*(.+)/i, /\d+\)\s*income\s*:\s*(.+)/i],
      forest_near: [/forest\s*present\s*near\s*:\s*(.+)/i, /\d+\)\s*forest\s*present\s*near\s*:\s*(.+)/i],
      aadhar_number: [/aa*dha*a*r\s*number\s*:\s*(.+)/i, /\d+\)\s*aa*dha*a*r\s*number\s*:\s*(.+)/i],
      forest: [/forest\s*:\s*(.+)/i, /\d+\)\s*forest\s*:\s*(.+)/i],
      forest_no: [/forest\s*no\s*:\s*(.+)/i, /\d+\)\s*forest\s*no\s*:\s*(.+)/i],
      resource: [/resource\s*:\s*(.+)/i, /\d+\)\s*resource\s*:\s*(.+)/i],
      village_no: [/village\s*no\s*:\s*(.+)/i, /\d+\)\s*village\s*no\s*:\s*(.+)/i],
      resources_rights: [/resource\s*:\s*(.+)/i, /\d+\)\s*resource\s*:\s*(.+)/i]
    };
  }

  async extractTextFromPDF(file: File): Promise<string> {
    try {
      const base64Content = await this.fileToBase64(file);
      
      const url = `https://vision.googleapis.com/v1/files:annotate?key=${this.apiKey}`;
      
      const payload = {
        requests: [
          {
            inputConfig: {
              content: base64Content,
              mimeType: file.type
            },
            features: [
              {
                type: "DOCUMENT_TEXT_DETECTION"
              }
            ]
          }
        ]
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Vision API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      let extractedText = '';
      if (result.responses && result.responses[0] && result.responses[0].responses) {
        for (const resp of result.responses[0].responses) {
          if (resp.fullTextAnnotation && resp.fullTextAnnotation.text) {
            extractedText += resp.fullTextAnnotation.text + '\n';
          }
        }
      }
      
      return extractedText;
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw error;
    }
  }

  async translateText(text: string): Promise<string> {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`;
      
      const payload = new URLSearchParams({
        q: text,
        target: 'en',
        format: 'text'
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload
      });
      
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.data && result.data.translations && result.data.translations[0]) {
        return result.data.translations[0].translatedText;
      }
      
      return text; // Return original if translation fails
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  identifyFormType(text: string): { tableName: string | null; formTitle: string | null } {
    const textUpper = text.toUpperCase();
    
    for (const [tableName, config] of Object.entries(this.formMappings)) {
      for (const title of config.titles) {
        if (textUpper.includes(title.toUpperCase())) {
          return { tableName, formTitle: title };
        }
      }
    }
    
    return { tableName: null, formTitle: null };
  }

  extractFieldValue(text: string, fieldName: string): string | null {
    const textLower = text.toLowerCase();
    
    if (this.fieldPatterns[fieldName]) {
      for (const pattern of this.fieldPatterns[fieldName]) {
        const match = textLower.match(pattern);
        if (match && match[1]) {
          let value = match[1].trim();
          value = value.replace(/\s+/g, ' '); // Replace multiple spaces with single space
          value = value.replace(/[.,;]+$/, ''); // Remove trailing punctuation
          if (value && !['', '_', '___', '____'].includes(value.toLowerCase())) {
            return value;
          }
        }
      }
    }
    
    return null;
  }

  extractFormData(text: string, tableName: string, formTitle: string): Record<string, any> {
    const extractedData: Record<string, any> = {};
    
    // Common fields for all forms
    extractedData.claimant_name = this.extractFieldValue(text, 'claimant_name');
    extractedData.village = this.extractFieldValue(text, 'village');
    extractedData.gram_panchayat = this.extractFieldValue(text, 'gram_panchayat');
    extractedData.taluka = this.extractFieldValue(text, 'taluka');
    extractedData.district = this.extractFieldValue(text, 'district');
    extractedData.state = this.extractFieldValue(text, 'state');
    
    // Set status based on form title
    const mapping = this.formMappings[tableName as keyof FormMappings];
    extractedData.status = mapping.status_mapping[formTitle] || 'Unknown';
    
    // Table-specific fields
    if (tableName === 'individual_forms') {
      extractedData.address = this.extractFieldValue(text, 'address');
      extractedData.land_no = this.extractFieldValue(text, 'land_no');
      extractedData.area = this.extractFieldValue(text, 'area');
      extractedData.income = this.extractFieldValue(text, 'income');
      extractedData.forest_near = this.extractFieldValue(text, 'forest_near');
      extractedData.aadhar_number = this.extractFieldValue(text, 'aadhar_number');
    } else if (tableName === 'forest_form') {
      extractedData.forest = this.extractFieldValue(text, 'forest');
      extractedData.forest_no = this.extractFieldValue(text, 'forest_no');
      extractedData.resource = this.extractFieldValue(text, 'resource');
    } else if (tableName === 'village_form') {
      extractedData.village_no = this.extractFieldValue(text, 'village_no');
      extractedData.resources_rights = this.extractFieldValue(text, 'resources_rights');
    }
    
    // Clean data
    const cleanData: Record<string, any> = {};
    const capsFields = ['district', 'village', 'state', 'forest'];
    
    for (const [key, value] of Object.entries(extractedData)) {
      if (value !== null && String(value).trim()) {
        if (key === 'area' || key === 'income') {
          const numericMatch = String(value).match(/[\d.]+/);
          if (numericMatch) {
            cleanData[key] = parseFloat(numericMatch[0]);
          }
        } else if (capsFields.includes(key)) {
          cleanData[key] = String(value).trim().toUpperCase();
        } else {
          cleanData[key] = String(value).trim();
        }
      }
    }
    
    return cleanData;
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remove data:mime;base64, prefix
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  async processDocument(file: File): Promise<ProcessingResult> {
    try {
      console.log('🔄 Starting document processing...');
      
      // Step 1: Extract text using OCR
      console.log('📄 Extracting text from document...');
      const extractedText = await this.extractTextFromPDF(file);
      
      if (!extractedText.trim()) {
        return { success: false, error: 'No text could be extracted from the document' };
      }
      
      // Step 2: Translate to English
      console.log('🔄 Translating to English...');
      const translatedText = await this.translateText(extractedText);
      
      // Step 3: Identify form type
      console.log('🔍 Identifying form type...');
      const { tableName, formTitle } = this.identifyFormType(translatedText);
      
      if (!tableName || !formTitle) {
        return { success: false, error: 'Could not identify form type from the document' };
      }
      
      // Step 4: Extract form data
      console.log('📊 Extracting form data...');
      const extractedData = this.extractFormData(translatedText, tableName, formTitle);
      
      return {
        success: true,
        table_name: tableName,
        form_title: formTitle,
        extracted_data: extractedData
      };
      
    } catch (error) {
      console.error('Processing error:', error);
      return { 
        success: false, 
        error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

export default OCRProcessor;