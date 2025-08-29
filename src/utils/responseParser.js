/**
 * Response parser for different listing types
 */

/**
 * Parse OpenAI response for Book listings
 */
export const parseBookResponse = (rawResponse) => {
  try {
    console.log('📖 Parsing Book response...');
    console.log('📖 Raw OpenAI response:', rawResponse);
    
    // Try to extract JSON from the response
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Sometimes OpenAI returns just JSON without extra text
      const listing = JSON.parse(rawResponse.trim());
      console.log('✅ Parsed book listing (no match):', listing);
      console.log('📖 Book item_specifics:', listing.item_specifics);
      console.log('📖 Author found:', listing.item_specifics?.Author);
      console.log('📖 ISBN found:', listing.item_specifics?.ISBN);
      return listing;
    }

    const listing = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed book listing (with match):', listing);
    console.log('📖 Book item_specifics:', listing.item_specifics);
    console.log('📖 Author found:', listing.item_specifics?.Author);
    console.log('📖 ISBN found:', listing.item_specifics?.ISBN);
    
    // Validate required book fields
    if (!listing.title) {
      throw new Error('Missing required field: title');
    }
    
    return listing;
  } catch (error) {
    console.error('❌ Error parsing book response:', error);
    console.error('❌ Failed response text:', rawResponse);
    throw new Error(`Failed to parse book listing: ${error.message}`);
  }
};

/**
 * Parse OpenAI response for Book Lots listings
 */
export const parseBookLotsResponse = (rawResponse) => {
  try {
    console.log('📚 Parsing Book Lots response...');
    
    // Book lots might return an array of books or a single lot listing
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const listing = JSON.parse(rawResponse.trim());
      console.log('✅ Parsed book lots listing:', listing);
      return listing;
    }

    const listing = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed book lots listing:', listing);
    
    return listing;
  } catch (error) {
    console.error('❌ Error parsing book lots response:', error);
    throw new Error(`Failed to parse book lots listing: ${error.message}`);
  }
};

/**
 * Parse OpenAI response for CD/Music listings
 */
export const parseCDMusicResponse = (rawResponse) => {
  try {
    console.log('🎵 Parsing CD/Music response...');
    
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const listing = JSON.parse(rawResponse.trim());
      console.log('✅ Parsed CD/Music listing:', listing);
      return listing;
    }

    const listing = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed CD/Music listing:', listing);
    
    return listing;
  } catch (error) {
    console.error('❌ Error parsing CD/Music response:', error);
    throw new Error(`Failed to parse CD/Music listing: ${error.message}`);
  }
};

/**
 * Parse OpenAI response for DVD/Movie listings
 */
export const parseDVDMovieResponse = (rawResponse) => {
  try {
    console.log('🎬 Parsing DVD/Movie response...');
    
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const listing = JSON.parse(rawResponse.trim());
      console.log('✅ Parsed DVD/Movie listing:', listing);
      return listing;
    }

    const listing = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed DVD/Movie listing:', listing);
    
    return listing;
  } catch (error) {
    console.error('❌ Error parsing DVD/Movie response:', error);
    throw new Error(`Failed to parse DVD/Movie listing: ${error.message}`);
  }
};

/**
 * Parse OpenAI response for VHS listings
 */
export const parseVHSResponse = (rawResponse) => {
  try {
    console.log('📼 Parsing VHS response...');
    
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const listing = JSON.parse(rawResponse.trim());
      console.log('✅ Parsed VHS listing:', listing);
      return listing;
    }

    const listing = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed VHS listing:', listing);
    
    return listing;
  } catch (error) {
    console.error('❌ Error parsing VHS response:', error);
    throw new Error(`Failed to parse VHS listing: ${error.message}`);
  }
};

/**
 * Parse OpenAI response for General listings
 */
export const parseGeneralResponse = (rawResponse) => {
  try {
    console.log('📦 Parsing General response...');
    
    let jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const listing = JSON.parse(rawResponse.trim());
      console.log('✅ Parsed general listing:', listing);
      return listing;
    }

    const listing = JSON.parse(jsonMatch[0]);
    console.log('✅ Parsed general listing:', listing);
    
    return listing;
  } catch (error) {
    console.error('❌ Error parsing general response:', error);
    throw new Error(`Failed to parse general listing: ${error.message}`);
  }
};

/**
 * Main parser that routes to the appropriate listing type parser
 */
export const parseListingResponse = (rawResponse, listingType) => {
  console.log(`🔍 Parsing response for listing type: ${listingType}`);
  
  if (!rawResponse) {
    throw new Error('No response provided');
  }

  switch (listingType) {
    case 'BOOK_ITEM':
      return parseBookResponse(rawResponse);
    
    case 'BOOK_LOTS':
      return parseBookLotsResponse(rawResponse);
    
    case 'CD_MUSIC':
      return parseCDMusicResponse(rawResponse);
    
    case 'DVD_MOVIE':
      return parseDVDMovieResponse(rawResponse);
    
    case 'VHS_LISTING':
      return parseVHSResponse(rawResponse);
    
    case 'GENERAL_LISTING':
      return parseGeneralResponse(rawResponse);
    
    default:
      console.warn(`Unknown listing type: ${listingType}, using general parser`);
      return parseGeneralResponse(rawResponse);
  }
};