import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/**
 * Open PDF in native print/preview dialog
 * @param {string} html - HTML content
 * @returns {Promise}
 */
export const viewPDF = async (html) => {
  try {
    await Print.printAsync({ html });
  } catch (error) {
    console.error('Error viewing PDF:', error);
    throw error;
  }
};

/**
 * Generate PDF and open share dialog
 * @param {string} html - HTML content
 * @returns {Promise}
 */
export const sharePDF = async (html) => {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share PDF',
      UTI: 'com.adobe.pdf'
    });
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw error;
  }
};