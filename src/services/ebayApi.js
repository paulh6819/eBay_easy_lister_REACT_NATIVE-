/**
 * eBay Trading API Integration Module
 * Handles authentication, photo hosting, and eBay listing creation
 */

const axios = require('axios');
const FormData = require('form-data');

/**
 * Get eBay Access Token
 * Uses User Token for listing creation (valid for 2+ years)
 * @returns {Promise<string>} eBay access token
 */
async function getEbayAccessToken() {
  try {
    // Use the User Token directly - it's already valid for 2+ years
    if (process.env.EBAY_USER_TOKEN) {
      console.log("✅ Using existing User Token for listing creation");
      return process.env.EBAY_USER_TOKEN;
    } else {
      throw new Error("No User Token available - required for creating listings");
    }
  } catch (error) {
    console.error("❌ eBay token error:", error.message);
    throw error;
  }
}

/**
 * Host photo to external server for eBay compatibility
 * @param {Buffer} fileBuffer - Photo file buffer
 * @param {string} originalFilename - Original filename
 * @param {string} mimetype - File mime type
 * @returns {Promise<Object>} Hosted photo result
 */
async function hostPhotoToServer(fileBuffer, originalFilename, mimetype) {
  try {
    const externalHostUrl = process.env.EXTERNAL_PHOTO_HOST_URL;

    if (!externalHostUrl) {
      throw new Error("EXTERNAL_PHOTO_HOST_URL not configured");
    }

    console.log(`📸 Uploading to GameSighter: ${originalFilename} (${fileBuffer.length} bytes)`);
    console.log(`🔗 GameSighter URL: ${externalHostUrl}`);

    const formData = new FormData();
    formData.append("photo", fileBuffer, {
      filename: originalFilename,
      contentType: mimetype,
    });

    console.log(`⏰ Starting upload with 2 minute timeout...`);
    const startTime = Date.now();

    const response = await axios.post(externalHostUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        "User-Agent": "eBay-Listing-App/1.0",
      },
      timeout: 120000, // 2 minutes
      maxContentLength: 10 * 1024 * 1024, // 10MB max
      maxBodyLength: 10 * 1024 * 1024, // 10MB max
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📊 Upload progress: ${percentCompleted}%`);
      }
    });

    const uploadTime = Date.now() - startTime;
    console.log(`⏱️ Upload completed in ${uploadTime}ms`);
    console.log(`📤 GameSighter response:`, response.data);

    let hostedUrl = response.data.url;
    let filename = response.data.filename;

    if (!hostedUrl && filename) {
      hostedUrl = `https://gamesighter.com/uploads/${filename}`;
    }

    console.log(`✅ Photo hosted at: ${hostedUrl}`);

    return {
      success: true,
      hostedUrl: hostedUrl,
      originalFilename: originalFilename,
      server: externalHostUrl,
    };
  } catch (error) {
    console.error(`❌ GameSighter upload failed:`, error.message);
    if (error.code === 'ECONNABORTED') {
      console.error(`⏰ Upload timed out after ${error.timeout || 'unknown'}ms`);
    }
    return {
      success: false,
      error: error.message,
      hostedUrl: null,
    };
  }
}

/**
 * Upload multiple photos for eBay listing
 * @param {Array} photos - Array of photo objects with buffer/data
 * @returns {Promise<Object>} Upload results with eBay-compatible URLs
 */
async function uploadPhotosForEbayListing(photos) {
  try {
    console.log(`📸 Uploading ${photos.length} photos to external server...`);
    
    const ebayPhotoUrls = [];
    const uploadResults = [];
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      console.log(`🔄 Uploading photo ${i + 1}/${photos.length}: ${photo.originalFilename || `photo_${i}.jpg`}`);
      
      // Convert photo data to buffer if needed
      let fileBuffer = photo.buffer || photo.data;
      const filename = photo.originalFilename || `photo_${i}.jpg`;
      const mimetype = photo.mimetype || 'image/jpeg';
      
      const uploadResult = await hostPhotoToServer(fileBuffer, filename, mimetype);
      uploadResults.push(uploadResult);
      
      if (uploadResult.success) {
        ebayPhotoUrls.push(uploadResult.hostedUrl);
        console.log(`✅ Photo uploaded: ${uploadResult.hostedUrl}`);
      } else {
        console.error(`❌ Photo upload failed: ${uploadResult.error}`);
      }
    }
    
    return {
      success: ebayPhotoUrls.length > 0,
      ebayPhotoUrls,
      uploadResults,
      totalPhotos: photos.length,
      successfulUploads: ebayPhotoUrls.length
    };
  } catch (error) {
    console.error('❌ Error uploading photos for eBay:', error);
    return {
      success: false,
      error: error.message,
      ebayPhotoUrls: [],
      uploadResults: []
    };
  }
}

/**
 * Get eBay condition ID from condition string
 * @param {string} condition - Human-readable condition
 * @returns {string} eBay condition ID
 */
function getEbayConditionID(condition) {
  const conditionIdMap = {
    "Very Good": "4000",
    "Good": "5000",
    "Acceptable": "6000"
  };

  // Convert "Like New" to "Very Good"
  if (condition === "Like New") {
    condition = "Very Good";
  }

  return conditionIdMap[condition] || "5000"; // Default to Good
}

/**
 * Map category string to eBay category ID
 * @param {string} category - Human-readable category
 * @param {string} listingType - Listing type for context
 * @returns {string} eBay category ID
 */
function getEbayCategoryID(category, listingType) {
  // Normalize category string
  const normalizedCategory = (category || '').toLowerCase();
  
  // Book categories
  if (listingType === 'BOOK_ITEM' || listingType === 'BOOK_LOTS' || normalizedCategory.includes('book')) {
    if (normalizedCategory.includes('fiction') || normalizedCategory.includes('literature') || normalizedCategory.includes('novel')) {
      return '377'; // Books > Fiction & Literature
    }
    if (normalizedCategory.includes('non-fiction') || normalizedCategory.includes('biography') || normalizedCategory.includes('history')) {
      return '29792'; // Books > Nonfiction
    }
    if (normalizedCategory.includes('textbook') || normalizedCategory.includes('education')) {
      return '172562'; // Books > Education > Textbooks
    }
    if (normalizedCategory.includes('children') || normalizedCategory.includes('kids')) {
      return '11450'; // Books > Children & Young Adults
    }
    return '377'; // Default to Fiction & Literature for books
  }
  
  // CD/Music categories
  if (listingType === 'CD_MUSIC' || normalizedCategory.includes('music') || normalizedCategory.includes('cd')) {
    return '176985'; // Music > CDs
  }
  
  // DVD/Movie categories
  if (listingType === 'DVD_MOVIE' || normalizedCategory.includes('dvd') || normalizedCategory.includes('movie')) {
    return '617'; // Movies & TV > DVDs & Blu-ray Discs
  }
  
  // VHS categories
  if (listingType === 'VHS_LISTING' || normalizedCategory.includes('vhs')) {
    return '309'; // Movies & TV > VHS Tapes
  }
  
  // Electronics
  if (normalizedCategory.includes('electronic') || normalizedCategory.includes('computer') || normalizedCategory.includes('phone')) {
    return '58058'; // Computers/Tablets & Networking
  }
  
  // Collectibles
  if (normalizedCategory.includes('collectible') || normalizedCategory.includes('vintage')) {
    return '1'; // Collectibles
  }
  
  // Default fallback - use general books category
  return '377'; // Books > Fiction & Literature
}

/**
 * Escape XML special characters for eBay API
 * @param {string} unsafe - Unescaped string
 * @returns {string} XML-safe string
 */
function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Build eBay XML request for Trading API
 * @param {Object} listing - Listing data
 * @param {Array} photoUrls - Array of hosted photo URLs
 * @returns {string} eBay XML request
 */
function buildEbayXMLRequest(listing, photoUrls) {
  const conditionID = getEbayConditionID(listing.condition);
  const categoryID = getEbayCategoryID(listing.category, listing.listingType);
  
  // Build photo gallery XML
  let pictureDetailsXml = '';
  if (photoUrls && photoUrls.length > 0) {
    const photoUrlsXml = photoUrls.map(url => `<PictureURL>${escapeXml(url)}</PictureURL>`).join('');
    pictureDetailsXml = `
      <PictureDetails>
        ${photoUrlsXml}
        <GalleryType>Gallery</GalleryType>
      </PictureDetails>
    `;
  }
  
  // Build item specifics XML
  let itemSpecificsXml = '';
  
  // Start with required book specifics if this is a book
  const allSpecifics = { ...listing.itemSpecifics };
  
  // Add required book specifics based on category  
  if (categoryID === '377' || categoryID === '29792' || categoryID === '11450' || categoryID === '172562') {
    // Use data from OpenAI item_specifics, or extract from title as fallback
    
    // Book Title - use OpenAI data if available, otherwise extract from title
    if (!allSpecifics['Book Title']) {
      // For your current book "The Salem Syndrome: A Novel of Medicine and Law by Robert H. Bartlett"
      // Extract just "The Salem Syndrome"
      let bookTitle = listing.title;
      
      // Try to clean up the title - remove common patterns
      bookTitle = bookTitle.replace(/:\s*.*$/i, '').trim(); // Remove ": Subtitle and everything after"
      bookTitle = bookTitle.replace(/\s*by\s+.*$/i, '').trim(); // Remove "by Author"
      bookTitle = bookTitle.replace(/\s*-\s*.*$/i, '').trim(); // Remove "- Description"
      
      allSpecifics['Book Title'] = bookTitle;
    }
    
    // Author - required field for books
    if (!allSpecifics['Author']) {
      // Try to extract author from the title if not provided by OpenAI
      const authorMatch = listing.title.match(/by\s+([^-]+)/i);
      if (authorMatch) {
        allSpecifics['Author'] = authorMatch[1].trim();
      } else {
        allSpecifics['Author'] = 'Unknown';
      }
    }
    
    // Use OpenAI data if available, otherwise use defaults
    if (!allSpecifics['Format'] && !allSpecifics['format']) {
      allSpecifics['Format'] = 'Paperback';
    }
    
    if (!allSpecifics['Language'] && !allSpecifics['language']) {
      allSpecifics['Language'] = 'English';
    }
    
    if (!allSpecifics['Book Series']) {
      allSpecifics['Book Series'] = 'N/A';
    }
  }
  
  if (allSpecifics && Object.keys(allSpecifics).length > 0) {
    const specifics = Object.entries(allSpecifics)
      .filter(([, value]) => value && value.toString().trim())
      .map(([key, value]) => `
        <NameValueList>
          <Name>${escapeXml(key)}</Name>
          <Value>${escapeXml(value.toString())}</Value>
        </NameValueList>
      `).join('');
    
    if (specifics) {
      itemSpecificsXml = `
        <ItemSpecifics>
          ${specifics}
        </ItemSpecifics>
      `;
    }
  }
  
  const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
    <AddItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
      <RequesterCredentials>
        <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
      </RequesterCredentials>
      <Item>
        <Title>${escapeXml(listing.title)}</Title>
        <Description><![CDATA[${listing.description || 'No description provided'}]]></Description>
        <PrimaryCategory>
          <CategoryID>${categoryID}</CategoryID>
        </PrimaryCategory>
        <StartPrice>${listing.price}</StartPrice>
        <CategoryMappingAllowed>true</CategoryMappingAllowed>
        <Country>US</Country>
        <Currency>USD</Currency>
        <DispatchTimeMax>3</DispatchTimeMax>
        <ListingDuration>GTC</ListingDuration>
        <ListingType>FixedPriceItem</ListingType>
        <PostalCode>10001</PostalCode>
        <Quantity>1</Quantity>
        <ShippingPackageDetails>
          <WeightMajor>1</WeightMajor>
          <WeightMinor>0</WeightMinor>
          <MeasurementUnit>English</MeasurementUnit>
          <PackageDepth>6</PackageDepth>
          <PackageLength>9</PackageLength>
          <PackageWidth>1</PackageWidth>
        </ShippingPackageDetails>
        <SellerProfiles>
          <SellerPaymentProfile>
            <PaymentProfileName>eBay Payments</PaymentProfileName>
          </SellerPaymentProfile>
          <SellerShippingProfile>
            <ShippingProfileName>FREE SHIPPING CURRENT July 14th 2022 Copy</ShippingProfileName>
          </SellerShippingProfile>
          <SellerReturnProfile>
            <ReturnProfileID>230502251026</ReturnProfileID>
          </SellerReturnProfile>
        </SellerProfiles>
        <Site>US</Site>
        <ConditionID>${conditionID}</ConditionID>
        ${pictureDetailsXml}
        ${itemSpecificsXml}
      </Item>
      <WarningLevel>High</WarningLevel>
    </AddItemRequest>`;
  
  return xmlRequest;
}

/**
 * Call eBay Trading API
 * @param {string} xmlRequest - XML request body
 * @returns {Promise<Object>} eBay API response
 */
async function callEbayTradingAPI(xmlRequest) {
  try {
    const isProduction = process.env.EBAY_SANDBOX !== "true";
    const apiUrl = isProduction 
      ? 'https://api.ebay.com/ws/api.dll'
      : 'https://api.sandbox.ebay.com/ws/api.dll';
    
    console.log(`🔄 Calling eBay Trading API (${isProduction ? 'Production' : 'Sandbox'})`);
    
    const response = await axios.post(apiUrl, xmlRequest, {
      headers: {
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-DEV-NAME': process.env.EBAY_DEV_ID,
        'X-EBAY-API-APP-NAME': process.env.EBAY_APP_ID,
        'X-EBAY-API-CERT-NAME': process.env.EBAY_CERT_ID,
        'X-EBAY-API-CALL-NAME': 'AddItem',
        'X-EBAY-API-SITEID': '0',
        'Content-Type': 'text/xml',
      },
      timeout: 30000,
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ eBay Trading API call failed:', error.message);
    if (error.response) {
      console.error('eBay API Error Response:', error.response.data);
    }
    throw error;
  }
}

/**
 * Parse eBay API response
 * @param {string} xmlResponse - eBay XML response
 * @returns {Object} Parsed response data
 */
function parseEbayResponse(xmlResponse) {
  try {
    // Simple XML parsing for key fields
    // In a production environment, you'd use a proper XML parser like xml2js
    const ackMatch = xmlResponse.match(/<Ack>(.*?)<\/Ack>/);
    const itemIdMatch = xmlResponse.match(/<ItemID>(.*?)<\/ItemID>/);
    const feesMatch = xmlResponse.match(/<InsertionFee currencyID="USD">(.*?)<\/InsertionFee>/);
    const errorsMatch = xmlResponse.match(/<Errors>(.*?)<\/Errors>/s);
    
    const ack = ackMatch ? ackMatch[1] : 'Unknown';
    const isSuccess = ack === 'Success' || ack === 'Warning';
    
    if (isSuccess) {
      const itemId = itemIdMatch ? itemIdMatch[1] : null;
      const insertionFee = feesMatch ? parseFloat(feesMatch[1]) : 0;
      
      return {
        success: true,
        ack,
        itemId,
        ebayListingId: itemId,
        url: itemId ? `https://www.ebay.com/itm/${itemId}` : null,
        fees: {
          insertionFee: insertionFee
        },
        message: 'Listing created successfully on eBay',
        rawResponse: xmlResponse
      };
    } else {
      // Parse errors
      let errorMessage = 'Unknown eBay error';
      if (errorsMatch) {
        const errorLongMessageMatch = errorsMatch[1].match(/<LongMessage>(.*?)<\/LongMessage>/);
        if (errorLongMessageMatch) {
          errorMessage = errorLongMessageMatch[1];
        }
      }
      
      return {
        success: false,
        ack,
        error: errorMessage,
        message: `eBay listing failed: ${errorMessage}`,
        rawResponse: xmlResponse
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse eBay response: ${error.message}`,
      message: 'eBay response parsing failed',
      rawResponse: xmlResponse
    };
  }
}

/**
 * Create a single eBay listing
 * @param {Object} listing - Listing data
 * @param {Array} photos - Array of photo objects
 * @returns {Promise<Object>} eBay listing result
 */
async function createEbayListing(listing, photos) {
  try {
    console.log(`📤 Creating eBay listing: ${listing.title}`);
    
    // 1. Get eBay access token
    const accessToken = await getEbayAccessToken();
    
    // 2. Upload photos to external server
    const photoUploadResult = await uploadPhotosForEbayListing(photos);
    
    if (!photoUploadResult.success || photoUploadResult.ebayPhotoUrls.length === 0) {
      throw new Error('Photo upload failed - cannot create listing without photos');
    }
    
    // 3. Build eBay XML request with listing data
    const xmlRequest = buildEbayXMLRequest(listing, photoUploadResult.ebayPhotoUrls);
    
    // 4. Call eBay Trading API
    const ebayResponse = await callEbayTradingAPI(xmlRequest);
    
    // 5. Parse response and return result
    const parsedResponse = parseEbayResponse(ebayResponse);
    
    // Add photo upload details to response
    parsedResponse.photoUpload = photoUploadResult;
    
    return parsedResponse;
  } catch (error) {
    console.error('❌ Error creating eBay listing:', error);
    return {
      success: false,
      error: error.message,
      message: `Failed to create eBay listing: ${error.message}`
    };
  }
}

/**
 * Build book-specific eBay XML request with enhanced book item specifics
 * @param {Object} bookListing - Book listing data
 * @param {Array} photoUrls - Array of hosted photo URLs
 * @returns {string} eBay XML request for books
 */
function buildEbayBookXMLRequest(bookListing, photoUrls) {
  const conditionID = getEbayConditionID(bookListing.condition);
  const categoryID = getEbayCategoryID(bookListing.category, 'BOOK_ITEM');
  
  // Build photo gallery XML
  let pictureDetailsXml = '';
  if (photoUrls && photoUrls.length > 0) {
    const photoUrlsXml = photoUrls.map(url => `<PictureURL>${escapeXml(url)}</PictureURL>`).join('');
    pictureDetailsXml = `
      <PictureDetails>
        ${photoUrlsXml}
        <GalleryType>Gallery</GalleryType>
      </PictureDetails>
    `;
  }
  
  // Build book-specific item specifics
  let itemSpecificsXml = '';
  const bookSpecifics = bookListing.item_specifics || {};
  
  const requiredBookSpecifics = {
    'Book Title': bookSpecifics['Book Title'] || bookListing.title,
    'Author': bookSpecifics['Author'] || 'Unknown',
    'Format': bookSpecifics['Format'] || 'Hardcover',
    'Language': bookSpecifics['Language'] || 'English',
    'Topic': bookSpecifics['Topic'] || 'General',
    'Publisher': bookSpecifics['Publisher'] || '',
    'Publication Year': bookSpecifics['Publication Year'] || '',
    'ISBN': bookSpecifics['ISBN'] || ''
  };

  // Add optional book specifics if provided
  const optionalBookSpecifics = {
    'Edition': bookSpecifics['Edition'] || '',
    'Series': bookSpecifics['Series'] || '',
    'Reading Level': bookSpecifics['Reading Level'] || 'Adult',
    'Number of Pages': bookSpecifics['Number of Pages'] || '',
    'Special Features': bookSpecifics['Special Features'] || ''
  };

  // Combine all specifics
  const allSpecifics = { ...requiredBookSpecifics, ...optionalBookSpecifics };

  // Build XML for non-empty specifics
  const specificItems = Object.entries(allSpecifics)
    .filter(([key, value]) => value && value.toString().trim() !== '')
    .map(([name, value]) => `
      <NameValueList>
        <Name>${escapeXml(name)}</Name>
        <Value>${escapeXml(value.toString())}</Value>
      </NameValueList>
    `).join('');

  if (specificItems) {
    itemSpecificsXml = `
      <ItemSpecifics>
        ${specificItems}
      </ItemSpecifics>
    `;
  }

  // Build shipping details - Media Mail is standard for books
  const shippingXml = `
    <ShippingDetails>
      <ShippingType>Flat</ShippingType>
      <ShippingServiceOptions>
        <ShippingServicePriority>1</ShippingServicePriority>
        <ShippingService>USPSMedia</ShippingService>
        <ShippingServiceCost>0.00</ShippingServiceCost>
        <FreeShipping>true</FreeShipping>
      </ShippingServiceOptions>
      <ShippingServiceOptions>
        <ShippingServicePriority>2</ShippingServicePriority>
        <ShippingService>USPSPriority</ShippingService>
        <ShippingServiceCost>8.99</ShippingServiceCost>
      </ShippingServiceOptions>
    </ShippingDetails>
  `;

  const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<AddItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${process.env.EBAY_USER_TOKEN}</eBayAuthToken>
  </RequesterCredentials>
  <Item>
    <Title>${escapeXml(bookListing.title)}</Title>
    <Description><![CDATA[${bookListing.description || ''}]]></Description>
    <PrimaryCategory>
      <CategoryID>${categoryID}</CategoryID>
    </PrimaryCategory>
    <ConditionID>${conditionID}</ConditionID>
    <StartPrice>${bookListing.price}</StartPrice>
    <Currency>USD</Currency>
    <Country>US</Country>
    <Location>United States</Location>
    <ListingType>FixedPriceItem</ListingType>
    <ListingDuration>GTC</ListingDuration>
    <Quantity>${bookListing.quantity || 1}</Quantity>
    ${pictureDetailsXml}
    ${itemSpecificsXml}
    ${shippingXml}
    <ReturnPolicy>
      <ReturnsAcceptedOption>ReturnsAccepted</ReturnsAcceptedOption>
      <RefundOption>MoneyBack</RefundOption>
      <ReturnsWithinOption>Days_30</ReturnsWithinOption>
      <ShippingCostPaidByOption>Buyer</ShippingCostPaidByOption>
    </ReturnPolicy>
  </Item>
</AddItemRequest>`;

  console.log('📖 Built book-specific eBay XML request:', {
    categoryID,
    conditionID,
    title: bookListing.title,
    price: bookListing.price,
    photoCount: photoUrls.length,
    hasItemSpecifics: !!itemSpecifics
  });

  return xmlRequest;
}

module.exports = {
  getEbayAccessToken,
  hostPhotoToServer,
  uploadPhotosForEbayListing,
  getEbayConditionID,
  escapeXml,
  buildEbayXMLRequest,
  buildEbayBookXMLRequest,
  callEbayTradingAPI,
  parseEbayResponse,
  createEbayListing
};