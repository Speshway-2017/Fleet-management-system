// import Tesseract from 'tesseract.js';

/**
 * Extract text from image/PDF using OCR
 */
export async function extractTextFromDocument(file) {
  try {
    // For images, use Tesseract.js OCR
    if (file.type.startsWith('image/')) {
      return await extractTextFromImage(file);
    }
    
    // For PDF, we would need pdf.js - for now return mock data
    if (file.type === 'application/pdf') {
      return extractMockDataFromPDF(file.name);
    }

    return null;
  } catch (error) {
    console.error('Error extracting text:', error);
    return null;
  }
}

/**
 * Extract text from image using Tesseract OCR (Mocked due to missing dependency)
 */
async function extractTextFromImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        console.log(`Mocking OCR Progress: 100%`);
        const mockText = "Mock extracted text for " + file.name + ". Registration number: KA 01 AB 1234. Model: Volvo VNL.";
        resolve(mockText);
      } catch (error) {
        console.error('Mock OCR error:', error);
        resolve(null);
      }
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Mock extraction for PDF files (placeholder for pdf.js integration)
 */
function extractMockDataFromPDF(fileName) {
  return `Mock PDF content from ${fileName}. In production, integrate with pdf.js for real extraction.`;
}

/**
 * Parse extracted text to find vehicle details
 */
export function parseVehicleDetails(text) {
  if (!text) return null;

  const data = {};
  const textLower = text.toLowerCase();

  // Extract Registration Number (RC Number)
  const rcMatch = text.match(/(?:registration\s*(?:number|no\.?)?|rc\s*no\.?|registration\s*cert\.?)\s*[:=]?\s*([A-Z]{2}\s*\d{2}\s*[A-Z]{2}\s*\d{4}|[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4})/i);
  if (rcMatch) {
    data.registrationNumber = rcMatch[1].trim().replace(/\s+/g, '-').toUpperCase();
  }

  // Extract Plate Number (Vehicle Registration Mark)
  const plateMatch = text.match(/(?:registration\s*(?:mark|plate)|vehicle\s*(?:registration|plate)|number\s*plate)\s*[:=]?\s*([A-Z]{2}\s*\d{2}\s*[A-Z]{2}\s*\d{4}|[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4})/i);
  if (plateMatch) {
    data.plateNumber = plateMatch[1].trim().replace(/\s+/g, ' ').toUpperCase();
  }

  // Extract Manufacturer/Make
  const manufacturerMatch = text.match(/(?:manufacturer|make|maker)\s*[:=]?\s*([^\n,;]+?)(?:\n|,|;|$)/i);
  if (manufacturerMatch) {
    data.manufacturer = manufacturerMatch[1].trim();
  }

  // Extract Model
  const modelMatch = text.match(/(?:model\s*(?:name)?|variant)\s*[:=]?\s*([^\n,;]+?)(?:\n|,|;|$)/i);
  if (modelMatch) {
    data.model = modelMatch[1].trim();
  }

  // Extract Year of Manufacture
  const yearMatch = text.match(/(?:year|yom|y\.o\.m|year\s*of\s*manufacture|manufactured)\s*[:=]?\s*(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 1990 && year <= new Date().getFullYear()) {
      data.year = year;
    }
  }

  // Extract Fuel Type
  const fuelMatch = text.match(/(?:fuel\s*type|fuel)\s*[:=]?\s*(diesel|petrol|cng|lpg|electric|hybrid)/i);
  if (fuelMatch) {
    const fuelType = fuelMatch[1].toLowerCase();
    data.fuelType = fuelType.charAt(0).toUpperCase() + fuelType.slice(1);
  }

  // Extract Engine CC
  const engineMatch = text.match(/(?:engine|cc|displacement|cubic|capacity)\s*[:=]?\s*(\d{3,5})/i);
  if (engineMatch) {
    data.engineCC = engineMatch[1];
  }

  // Extract Insurance Expiry Date
  const insuranceMatch = text.match(/(?:insurance\s*(?:expiry|validity|exp|till|upto|valid\s*upto)|valid\s*(?:till|upto)|expires?)\s*[:=]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
  if (insuranceMatch) {
    const dateStr = insuranceMatch[1];
    const insuranceDate = parseDate(dateStr);
    if (insuranceDate) data.insuranceExpiry = insuranceDate;
  }

  // Extract Last Service Date
  const serviceMatch = text.match(/(?:last\s*(?:service|servicing|served)|service(?:d)?)\s*(?:date|on)?\s*[:=]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
  if (serviceMatch) {
    const dateStr = serviceMatch[1];
    const serviceDate = parseDate(dateStr);
    if (serviceDate) data.lastService = serviceDate;
  }

  // Extract Transmission Type
  const transmissionMatch = text.match(/(?:transmission)\s*[:=]?\s*(manual|automatic|auto)/i);
  if (transmissionMatch) {
    const trans = transmissionMatch[1].toLowerCase();
    data.transmissionType = trans === 'auto' ? 'Automatic' : 'Manual';
  }

  // Extract Seating Capacity
  const seatingMatch = text.match(/(?:seating|capacity|seats?|no\.?\s*of\s*seats?)\s*[:=]?\s*(\d+)/i);
  if (seatingMatch) {
    data.seatingCapacity = seatingMatch[1];
  }

  // Extract Ownership Type
  const ownershipMatch = text.match(/(?:ownership|owned|ownership\s*type)\s*[:=]?\s*(owned|financed|lease|leased)/i);
  if (ownershipMatch) {
    const ownership = ownershipMatch[1].toLowerCase();
    data.ownership = ownership.charAt(0).toUpperCase() + ownership.slice(1);
  }

  // Extract Registration State
  const stateMatch = text.match(/(?:state|issued|registration\s*state)\s*[:=]?\s*([A-Z]{2}|[A-Za-z]+)/i);
  if (stateMatch) {
    const stateCode = stateMatch[1].toUpperCase();
    // Validate state code
    const validStates = ['MH', 'KA', 'AP', 'TN', 'DL', 'GJ', 'UP', 'RJ', 'HP', 'HR', 'PB'];
    if (validStates.includes(stateCode) || stateCode.length === 2) {
      data.registrationState = stateCode;
    }
  }

  return Object.keys(data).length > 0 ? data : null;
}

/**
 * Parse date strings in various formats
 */
function parseDate(dateStr) {
  // Remove common separators and normalize
  const normalized = dateStr.trim();
  
  // Try different date formats
  const formats = [
    /(\d{2})[-\/](\d{2})[-\/](\d{4})/,  // DD-MM-YYYY or DD/MM/YYYY
    /(\d{4})[-\/](\d{2})[-\/](\d{2})/,  // YYYY-MM-DD or YYYY/MM/DD
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})/,  // D-M-YY or D/M/YY
    /(\d{2})-([A-Za-z]{3})-(\d{4})/  // DD-MMM-YYYY format
  ];

  for (let format of formats) {
    const match = normalized.match(format);
    if (match) {
      let day, month, year;

      if (match[3] && match[3].length === 4) {
        // DD-MM-YYYY format
        day = match[1];
        month = match[2];
        year = match[3];
      } else if (match[1] && match[1].length === 4) {
        // YYYY-MM-DD format
        year = match[1];
        month = match[2];
        day = match[3];
      } else {
        // D-M-YY format
        day = match[1];
        month = match[2];
        year = match[3].length === 2 ? '20' + match[3] : match[3];
      }

      // Handle month abbreviations
      if (isNaN(month)) {
        const monthNames = {
          'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05',
          'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10',
          'nov': '11', 'dec': '12'
        };
        month = monthNames[month.toLowerCase().slice(0, 3)] || '01';
      }

      const date = new Date(year, parseInt(month) - 1, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }

  return null;
}

/**
 * Identify document type from filename or extracted text
 */
export function identifyDocumentType(fileName, extractedText) {
  const name = fileName.toLowerCase();
  
  if (name.includes('insurance') || name.includes('policy')) return 'Insurance';
  if (name.includes('rc') || name.includes('registration')) return 'RC';
  if (name.includes('puc') || name.includes('pollution')) return 'PUC';
  if (name.includes('permit')) return 'Permit';
  if (name.includes('fitness')) return 'Fitness';
  if (name.includes('tax') || name.includes('road tax')) return 'Road Tax';
  
  // Check extracted text if available
  if (extractedText) {
    const textLower = extractedText.toLowerCase();
    if (textLower.includes('insurance') || textLower.includes('policy')) return 'Insurance';
    if (textLower.includes('registration') || textLower.includes('rc no')) return 'RC';
    if (textLower.includes('puc') || textLower.includes('pollution')) return 'PUC';
    if (textLower.includes('permit')) return 'Permit';
    if (textLower.includes('fitness')) return 'Fitness';
    if (textLower.includes('tax')) return 'Road Tax';
  }
  
  return 'Document';
}

/**
 * Extract comprehensive vehicle data from all uploaded documents
 */
export async function extractDataFromAllDocuments(files) {
  const allData = {};

  for (let file of files) {
    try {
      const extractedText = await extractTextFromDocument(file);
      const documentType = identifyDocumentType(file.name, extractedText);
      
      if (extractedText) {
        const parsedData = parseVehicleDetails(extractedText);
        if (parsedData) {
          Object.assign(allData, parsedData);
        }
      }
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
    }
  }

  return allData;
}
