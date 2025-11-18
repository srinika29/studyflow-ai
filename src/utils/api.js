import {
  GlobalWorkerOptions,
  getDocument,
  version as pdfjsVersion,
} from 'pdfjs-dist/build/pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';

// Configure PDF.js worker (Vite-friendly)
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = pdfWorker;
}

export const callClaudeAPI = async (prompt, type = 'general') => {
  try {
    const response = await fetch('/.netlify/functions/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, type }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
};

export const parsePDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      verbosity: 0,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/standard_fonts/`
    }).promise;
    
    let fullText = '';
    
    // Loop through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items - use a simpler, more reliable approach
      const textItems = textContent.items
        .filter(item => item.str && item.str.trim().length > 0)
        .map(item => item.str);
      
      // Join with spaces and clean up
      let pageText = textItems.join(' ');
      
      // Clean up formatting
      pageText = pageText
        .replace(/\s+/g, ' ') // Multiple whitespace to single space
        .replace(/\s*\.\s*/g, '. ') // Fix spacing around periods
        .replace(/\s*,\s*/g, ', ') // Fix spacing around commas
        .replace(/\s*:\s*/g, ': ') // Fix spacing around colons
        .replace(/\s*;\s*/g, '; ') // Fix spacing around semicolons
        .replace(/\s+([.!?])\s+/g, '$1\n\n') // New paragraph after sentence endings
        .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
        .trim();
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error.message}. Please ensure the file is a valid PDF and try again.`);
  }
};

