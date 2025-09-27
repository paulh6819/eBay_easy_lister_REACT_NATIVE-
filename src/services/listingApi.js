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
  const startTime = Date.now();
  let timeoutId;
  try {
    console.log('🚀 Starting analyzePhotos request at:', new Date().toISOString());
    
    const formData = new FormData();
    
    // Add photos to form data
    photos.forEach((photo, index) => {
      console.log(`📸 Adding photo ${index + 1}/${photos.length}:`, photo.uri);
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
      url: `${API_BASE_URL}/api/analyze`,
      photoCount: photos.length,
      listingType,
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100) + '...'
    });
    
    console.log('⏰ Making fetch request...');
    
    // Create AbortController for timeout handling
    const controller = new AbortController();
    timeoutId = setTimeout(() => {
      console.log('⏰ Request timeout - aborting...');
      controller.abort();
    }, 120000); // 2 minutes timeout
    
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      // Don't set Content-Type header for FormData in React Native
      // The browser/React Native will set it automatically with boundary
      headers: {
        // Add a custom timeout header that the server can use
        'X-Client-Timeout': '120000', // 2 minutes
      },
    });
    
    // Clear the timeout since we got a response
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    console.log(`📊 Response received after ${responseTime}ms`);
    
    if (!response.ok) {
      console.error('❌ HTTP Error Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseTime: responseTime
      });
      const errorText = await response.text();
      console.error('❌ Error Response Body:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    console.log('✅ Response OK, parsing JSON...');
    const result = await response.json();
    console.log('✅ OpenAI Response received:', {
      success: !!result,
      hasRawResponse: !!result.rawResponse,
      hasHostedPhotos: !!result.hostedPhotos,
      hostedPhotoCount: result.hostedPhotos?.length || 0,
      totalTime: Date.now() - startTime
    });
    
    return result;
  } catch (error) {
    // Clear timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const totalTime = Date.now() - startTime;
    console.error('❌ Error analyzing photos:', {
      error: error.message,
      name: error.name,
      stack: error.stack,
      totalTime: totalTime,
      url: `${API_BASE_URL}/api/analyze`,
      timestamp: new Date().toISOString()
    });
    
    // Add more specific error information
    if (error.name === 'AbortError') {
      console.error('⏰ Request Timeout:', {
        message: 'Request was aborted due to timeout (2 minutes)',
        totalTime: totalTime,
        suggestion: 'Server processing is taking too long. Consider optimizing server or increasing timeout.'
      });
    } else if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      console.error('🌐 Network Error Details:', {
        message: 'This might be due to timeout, network connectivity, or CORS issues',
        suggestions: [
          'Check if server is running on ' + API_BASE_URL,
          'Verify network connectivity',
          'Check if request is timing out (current time: ' + totalTime + 'ms)',
          'Ensure CORS is properly configured on server'
        ]
      });
    }
    
    throw error;
  }
};