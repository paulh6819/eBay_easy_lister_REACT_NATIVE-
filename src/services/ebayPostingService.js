/**
 * eBay Posting Service
 * Handles posting individual listings and batch posting to eBay
 */

// For React Native iOS Simulator, use your local IP address
const API_BASE_URL = 'http://192.168.1.207:3000';

/**
 * Post a single listing to eBay
 * @param {Object} listingData - The listing data to post
 * @param {string} listingData.id - Unique listing ID
 * @param {string} listingData.title - Listing title
 * @param {string} listingData.price - Listing price
 * @param {string} listingData.condition - Item condition
 * @param {string} listingData.category - eBay category
 * @param {string} listingData.description - Item description
 * @param {Array} listingData.photos - Array of photo objects
 * @param {Object} listingData.itemSpecifics - Item specific details
 * @returns {Promise<Object>} Posting result with success/error status
 */
export const postSingleListing = async (listingData) => {
  try {
    console.log('📤 Posting single listing to eBay:', listingData.id);
    
    // TODO: Replace with actual eBay API call
    // For now, simulate the posting process
    const postingResult = await simulateEbayPosting(listingData);
    
    console.log('✅ Single listing posted successfully:', postingResult);
    return {
      success: true,
      listingId: listingData.id,
      ebayListingId: postingResult.ebayListingId,
      message: 'Listing posted successfully to eBay',
      data: postingResult
    };
    
  } catch (error) {
    console.error('❌ Error posting single listing:', error);
    return {
      success: false,
      listingId: listingData.id,
      error: error.message,
      message: 'Failed to post listing to eBay'
    };
  }
};

/**
 * Post multiple listings to eBay
 * @param {Array} listingsArray - Array of listing data objects
 * @returns {Promise<Object>} Batch posting results with individual statuses
 */
export const postAllListings = async (listingsArray) => {
  try {
    console.log('📤 Starting batch posting of', listingsArray.length, 'listings to eBay');
    
    const results = {
      total: listingsArray.length,
      successful: 0,
      failed: 0,
      results: []
    };
    
    // Process listings in parallel for better performance
    const postingPromises = listingsArray.map(listing => postSingleListing(listing));
    const postingResults = await Promise.allSettled(postingPromises);
    
    // Process results
    postingResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const postResult = result.value;
        results.results.push(postResult);
        
        if (postResult.success) {
          results.successful++;
        } else {
          results.failed++;
        }
      } else {
        results.failed++;
        results.results.push({
          success: false,
          listingId: listingsArray[index].id,
          error: result.reason.message,
          message: 'Failed to process listing'
        });
      }
    });
    
    console.log('✅ Batch posting completed:', results);
    return {
      success: true,
      message: `Posted ${results.successful} of ${results.total} listings successfully`,
      data: results
    };
    
  } catch (error) {
    console.error('❌ Error in batch posting:', error);
    return {
      success: false,
      error: error.message,
      message: 'Batch posting failed'
    };
  }
};

/**
 * Process listings in smaller batches to avoid overwhelming the API
 * @param {Array} listingsArray - Array of listing data objects
 * @param {number} batchSize - Number of listings per batch (default: 5)
 * @returns {Promise<Object>} Batch processing results
 */
export const postListingsBatch = async (listingsArray, batchSize = 5) => {
  try {
    console.log(`📦 Processing ${listingsArray.length} listings in batches of ${batchSize}`);
    
    const results = {
      total: listingsArray.length,
      successful: 0,
      failed: 0,
      results: []
    };
    
    // Split into batches
    for (let i = 0; i < listingsArray.length; i += batchSize) {
      const batch = listingsArray.slice(i, i + batchSize);
      console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1} (${batch.length} listings)`);
      
      // Process current batch
      const batchResult = await postAllListings(batch);
      
      // Aggregate results
      if (batchResult.success) {
        results.successful += batchResult.data.successful;
        results.failed += batchResult.data.failed;
        results.results.push(...batchResult.data.results);
      } else {
        results.failed += batch.length;
        batch.forEach(listing => {
          results.results.push({
            success: false,
            listingId: listing.id,
            error: batchResult.error,
            message: 'Batch processing failed'
          });
        });
      }
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < listingsArray.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('✅ All batches processed:', results);
    return {
      success: true,
      message: `Processed ${results.successful} of ${results.total} listings successfully`,
      data: results
    };
    
  } catch (error) {
    console.error('❌ Error in batch processing:', error);
    return {
      success: false,
      error: error.message,
      message: 'Batch processing failed'
    };
  }
};

/**
 * Simulate eBay posting for development/testing
 * @param {Object} listingData - The listing data
 * @returns {Promise<Object>} Simulated eBay response
 */
const simulateEbayPosting = async (listingData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Simulate random success/failure for testing
  if (Math.random() > 0.1) { // 90% success rate
    return {
      ebayListingId: `EBAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'Active',
      url: `https://www.ebay.com/itm/simulated-listing-${Date.now()}`,
      fees: {
        insertionFee: 0.35,
        finalValueFee: parseFloat(listingData.price) * 0.1
      },
      duration: '7 days',
      postedAt: new Date().toISOString()
    };
  } else {
    throw new Error('eBay API returned an error: Listing validation failed');
  }
};

/**
 * Check if the eBay posting service is available
 * @returns {Promise<boolean>} Service availability status
 */
export const checkEbayServiceStatus = async () => {
  try {
    // TODO: Replace with actual eBay API health check
    console.log('🔍 Checking eBay service status...');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ eBay service is available');
    return true;
  } catch (error) {
    console.error('❌ eBay service unavailable:', error);
    return false;
  }
};