/**
 * Listing API service for the new /api/analyze endpoint
 */

// For React Native iOS Simulator, use your local IP address
const API_BASE_URL = 'http://192.168.1.207:3000';

/**
 * Analyze photos and generate listing using the new unified endpoint
 * @param {Object} params - Analysis parameters
 * @param {Array} params.photos - Array of photo objects with uri property
 * @param {string} params.listingType - Type of listing (BOOK_ITEM, BOOK_LOTS, etc.)
 * @param {string} params.prompt - The AI prompt to use
 * @returns {Promise<Object>} Generated listing data
 */
export const analyzePhotos = async ({ photos, listingType = 'auto', prompt }) => {
  try {
    const formData = new FormData();
    
    // Add photos to form data
    photos.forEach((photo, index) => {
      formData.append('photos', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `photo_${index}.jpg`,
      });
    });
    
    // Add listing type and prompt
    formData.append('listingType', listingType);
    formData.append('prompt', prompt);
    
    console.log('🚀 Sending to /api/analyze:', {
      photoCount: photos.length,
      listingType,
      promptPreview: prompt.substring(0, 100) + '...'
    });
    
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData in React Native
      // The browser/React Native will set it automatically with boundary
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ OpenAI Response received:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error analyzing photos:', error);
    throw error;
  }
};