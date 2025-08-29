/**
 * eBay Posting Service
 * Handles posting individual listings and batch posting to eBay
 */
import * as FileSystem from 'expo-file-system';

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
    console.log('📤 Full listing data:', JSON.stringify(listingData, null, 2));
    
    console.log('📤 Listing data structure:', JSON.stringify({
      id: listingData.id,
      title: listingData.title || listingData.parsedListing?.title,
      hasHostedPhotos: !!listingData.hostedPhotos,
      hostedPhotoCount: listingData.hostedPhotos?.length || 0,
      hostedPhotos: listingData.hostedPhotos?.map((p, i) => ({ index: i, url: p.url }))
    }, null, 2));
    
    // Use hosted photo URLs instead of uploading photos
    if (!listingData.hostedPhotos || listingData.hostedPhotos.length === 0) {
      console.log('⚠️ No hosted photos found, checking for regular photos as fallback...');
      
      // Fallback: if no hosted photos but we have regular photos, show helpful error
      if (listingData.photos && listingData.photos.length > 0) {
        throw new Error('Photos are not hosted yet. Please try regenerating the listing or wait for photos to upload to GameSighter.');
      } else {
        throw new Error('No photos available - listing requires photos for eBay posting');
      }
    }
    
    // Extract only successful photo URLs
    const photoUrls = listingData.hostedPhotos
      .filter(photo => photo.url && !photo.error)
      .map(photo => photo.url);
    
    if (photoUrls.length === 0) {
      throw new Error('No valid hosted photo URLs found - all photos failed to upload');
    }
    
    console.log(`📸 Using ${photoUrls.length} pre-hosted photo URLs:`, photoUrls);
    
    // Prepare listing data with hosted photo URLs
    // Handle both flat structure and parsedListing structure for backward compatibility
    const listing = listingData.parsedListing || listingData;
    
    const ebayListingData = {
      title: listing.title,
      price: listing.price,
      condition: listing.condition,
      category: listing.category,
      description: listing.description,
      itemSpecifics: listing.itemSpecifics || listing.item_specifics || {},
      listingType: listingData.listingType?.type || listing.listingType || 'GENERAL_LISTING',
      hostedPhotoUrls: photoUrls // Pass pre-hosted URLs directly
    };
    
    // Call eBay listing endpoint with hosted URLs
    console.log(`📤 Calling ${API_BASE_URL}/api/list-to-ebay-with-urls`);
    const response = await fetch(`${API_BASE_URL}/api/list-to-ebay-with-urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ebayListingData)
    });
    
    console.log('📤 Response status:', response.status);
    console.log('📤 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('📤 Error response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('📤 Server response:', result);
    
    if (result.success) {
      console.log('✅ Single listing posted successfully:', result.data?.itemId);
      return {
        success: true,
        listingId: listingData.id,
        ebayListingId: result.data?.itemId || result.data?.ebayListingId,
        message: result.message || 'Listing posted successfully to eBay',
        data: result.data,
        url: result.data?.url
      };
    } else {
      throw new Error(result.error || result.message || 'Unknown eBay error');
    }
    
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
 * Check if the eBay posting service is available
 * @returns {Promise<boolean>} Service availability status
 */
export const checkEbayServiceStatus = async () => {
  try {
    console.log('🔍 Checking eBay service status...');
    
    // Check server health
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const health = await response.json();
    
    if (health.status === 'ok') {
      console.log('✅ eBay service is available');
      return true;
    } else {
      console.log('❌ eBay service health check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ eBay service unavailable:', error);
    return false;
  }
};