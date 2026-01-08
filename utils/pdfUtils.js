import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/**
 * Generate PDF and open share dialog
 * @param {string} html - HTML content
 * @param {string} filename - Optional filename for PDF
 * @returns {Promise}
 */
export const generateAndSharePDF = async (html, filename = 'document.pdf') => {
  try {
    // Generate PDF file
    const { uri } = await Print.printToFileAsync({ html });
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      // Open share dialog (allows email, WhatsApp, save to files, etc.)
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share PDF',
        UTI: 'com.adobe.pdf'
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error generating/sharing PDF:', error);
    throw error;
  }
};

/**
 * Generate PDF file and return URI (for custom handling)
 * @param {string} html - HTML content
 * @returns {Promise<string>} URI of generated PDF
 */
export const generatePDFFile = async (html) => {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  } catch (error) {
    console.error('Error generating PDF file:', error);
    throw error;
  }
};