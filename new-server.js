const express = require('express');
const multer = require('multer');
const cors = require('cors');
const OpenAI = require('openai');
const { createEbayListing, hostPhotoToServer } = require('./src/services/ebayApi');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    fieldSize: 10 * 1024 * 1024, // 10MB limit per field (for base64 data)
    fields: 20, // Allow up to 20 form fields
  }
});

/**
 * Process photos and convert to base64 for OpenAI
 */
async function processPhotos(files) {
  if (!files || files.length === 0) {
    throw new Error('No photos provided');
  }

  const imageContents = files.map(file => ({
    type: "image_url",
    image_url: {
      url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    }
  }));

  console.log(`📸 Processed ${imageContents.length} photos`);
  return imageContents;
}

/**
 * Get the appropriate prompt based on listing type
 */
function getPrompt(listingType, imageCount) {
  // For now, we'll use the prompt passed from the client
  // This function can be expanded later for server-side prompt selection
  return null; // Will use client-provided prompt
}

/**
 * Call OpenAI Vision API
 */
async function callOpenAI(prompt, imageContents) {
  try {
    console.log('🤖 Calling OpenAI with prompt length:', prompt.length);
    console.log('🤖 Image count:', imageContents.length);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Updated to latest model
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...imageContents
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.1,
    });

    console.log('✅ OpenAI response received');
    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Parse and clean OpenAI response
 */
function parseAndCleanResponse(aiResponse) {
  try {
    console.log('📄 Raw AI Response (first 500 chars):', aiResponse?.substring(0, 500));
    console.log('📄 Raw AI Response (full):', aiResponse);
    
    if (!aiResponse || typeof aiResponse !== 'string') {
      throw new Error('Invalid response from OpenAI - not a string');
    }
    
    // Try to extract JSON from the response - look for complete JSON objects
    let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('❌ No JSON pattern found. Trying to parse entire response...');
      // Sometimes OpenAI returns just JSON without extra text
      try {
        const listing = JSON.parse(aiResponse.trim());
        console.log('📋 Parsed entire response as JSON:', listing);
        return listing;
      } catch (e) {
        throw new Error('No JSON found in response');
      }
    }

    const listing = JSON.parse(jsonMatch[0]);
    console.log('📋 Parsed listing data:', listing);
    
    return listing;
  } catch (error) {
    console.error('❌ Error parsing response:', error);
    console.log('❌ Full raw response for debugging:', JSON.stringify(aiResponse));
    throw new Error(`Failed to parse OpenAI response: ${error.message}`);
  }
}

// Just one clean endpoint
app.post("/api/analyze", upload.array('photos'), async (req, res) => {
  try {
    console.log('📥 Received analyze request from:', req.get('origin') || req.ip);
    console.log('Files:', req.files?.length || 0);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Headers:', req.headers['content-type']);

    const { listingType = "auto", prompt } = req.body;
    const photos = req.files;

    if (!photos || photos.length === 0) {
      return res.status(400).json({ error: 'No photos provided' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    console.log(`🔍 Processing ${photos.length} photos for ${listingType} listing`);

    // Process photos for OpenAI
    const imageContents = await processPhotos(photos);

    // Get appropriate prompt (using client-provided for now)
    const finalPrompt = prompt;

    // 🚀 Run OpenAI analysis and GameSighter uploads SIMULTANEOUSLY
    console.log('🚀 Starting OpenAI analysis and GameSighter uploads simultaneously...');
    
    const startTime = Date.now();
    
    // Create OpenAI promise
    const openaiPromise = callOpenAI(finalPrompt, imageContents);
    
    // Create GameSighter upload promises for ALL photos at once
    const uploadPromises = photos.map((photo, index) => {
      console.log(`📸 Queuing upload ${index + 1}/${photos.length}: ${photo.originalname || `photo_${index}.jpg`}`);
      return hostPhotoToServer(
        photo.buffer, 
        photo.originalname || `photo_${index}.jpg`, 
        photo.mimetype || 'image/jpeg'
      ).then(result => ({
        ...result,
        index,
        originalFilename: photo.originalname || `photo_${index}.jpg`
      })).catch(error => ({
        success: false,
        error: error.message,
        index,
        originalFilename: photo.originalname || `photo_${index}.jpg`
      }));
    });

    // Wait for BOTH OpenAI and ALL GameSighter uploads to complete
    const [aiResponse, uploadResults] = await Promise.all([
      openaiPromise,
      Promise.all(uploadPromises)
    ]);

    const totalTime = Date.now() - startTime;
    console.log(`⚡ Completed OpenAI + ${photos.length} uploads simultaneously in ${totalTime}ms`);

    // Process upload results
    const hostedPhotos = uploadResults.map(result => {
      if (result.success) {
        console.log(`✅ Photo ${result.index + 1} hosted: ${result.hostedUrl}`);
        return {
          url: result.hostedUrl,
          originalFilename: result.originalFilename,
          index: result.index
        };
      } else {
        console.error(`❌ Photo ${result.index + 1} upload failed: ${result.error}`);
        return {
          url: null,
          error: result.error,
          originalFilename: result.originalFilename,
          index: result.index
        };
      }
    });

    console.log(`🎉 Successfully got OpenAI response and uploaded ${hostedPhotos.filter(p => p.url).length}/${photos.length} photos`);
    res.json({ 
      success: true, 
      rawResponse: aiResponse,
      listingType: listingType,
      photoCount: photos.length,
      hostedPhotos: hostedPhotos
    });

  } catch (error) {
    console.error('❌ Analyze endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY 
  });
});

// Simple test endpoint
app.post('/api/test', (req, res) => {
  console.log('📥 Test endpoint hit!');
  res.json({ message: 'Test successful!', body: req.body });
});

// eBay listing endpoint
app.post('/api/list-to-ebay', upload.none(), async (req, res) => {
  try {
    console.log('📥 Received eBay listing request');
    console.log('Body keys:', Object.keys(req.body));

    const { listing, photoCount } = req.body;

    if (!listing) {
      return res.status(400).json({ error: 'No listing data provided' });
    }

    // Parse listing if it's a string (from form data)
    let parsedListing;
    try {
      parsedListing = typeof listing === 'string' ? JSON.parse(listing) : listing;
    } catch (error) {
      return res.status(400).json({ error: 'Invalid listing data format' });
    }

    // Extract photos from form data
    const photos = [];
    const numPhotos = parseInt(photoCount) || 0;
    
    if (numPhotos === 0) {
      return res.status(400).json({ error: 'No photos provided' });
    }

    console.log(`📸 Processing ${numPhotos} photos from form data`);

    for (let i = 0; i < numPhotos; i++) {
      const photoKey = `photo_${i}`;
      const photoDataStr = req.body[photoKey];
      
      if (!photoDataStr) {
        console.error(`❌ Missing photo data for ${photoKey}`);
        continue;
      }

      try {
        const photoData = JSON.parse(photoDataStr);
        const buffer = Buffer.from(photoData.data, 'base64');
        
        photos.push({
          buffer: buffer,
          originalFilename: photoData.name,
          mimetype: photoData.type
        });
        
        console.log(`✅ Processed ${photoKey}: ${photoData.name} (${buffer.length} bytes)`);
      } catch (error) {
        console.error(`❌ Error processing ${photoKey}:`, error);
      }
    }

    if (photos.length === 0) {
      return res.status(400).json({ error: 'No valid photos found' });
    }

    console.log(`📤 Creating eBay listing: ${parsedListing.title} with ${photos.length} photos`);

    // Create eBay listing - this will upload photos to GameSighter and get URLs
    const ebayResult = await createEbayListing(parsedListing, photos);

    if (ebayResult.success) {
      console.log('✅ eBay listing created successfully:', ebayResult.itemId);
      res.json({
        success: true,
        message: 'Listing posted successfully to eBay',
        data: ebayResult
      });
    } else {
      console.error('❌ eBay listing failed:', ebayResult.error);
      res.status(500).json({
        success: false,
        error: ebayResult.error,
        message: ebayResult.message || 'Failed to create eBay listing'
      });
    }

  } catch (error) {
    console.error('❌ eBay listing endpoint error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: 'Internal server error while creating eBay listing'
    });
  }
});

// eBay listing endpoint with pre-hosted photo URLs
app.post('/api/list-to-ebay-with-urls', async (req, res) => {
  try {
    console.log('📥 Received eBay listing request with hosted URLs');
    console.log('Body keys:', Object.keys(req.body));

    const {
      title,
      price,
      condition,
      category,
      description,
      itemSpecifics,
      listingType,
      hostedPhotoUrls
    } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: 'Missing required listing fields (title, price)' });
    }

    if (!hostedPhotoUrls || hostedPhotoUrls.length === 0) {
      return res.status(400).json({ error: 'No hosted photo URLs provided' });
    }

    console.log(`📤 Creating eBay listing: ${title} with ${hostedPhotoUrls.length} pre-hosted photos`);

    // Create listing data structure that ebayApi.js expects
    const listingData = {
      title,
      price,
      condition,
      category,
      description,
      itemSpecifics: itemSpecifics || {},
      listingType: listingType || 'GENERAL_LISTING'
    };

    // Call createEbayListing but pass hosted URLs directly instead of photos to upload
    const ebayResult = await createEbayListingWithUrls(listingData, hostedPhotoUrls);

    if (ebayResult.success) {
      console.log('✅ eBay listing created successfully:', ebayResult.itemId);
      res.json({
        success: true,
        message: 'Listing posted successfully to eBay',
        data: ebayResult
      });
    } else {
      console.error('❌ eBay listing failed:', ebayResult.error);
      res.status(500).json({
        success: false,
        error: ebayResult.error,
        message: ebayResult.message || 'Failed to create eBay listing'
      });
    }

  } catch (error) {
    console.error('❌ eBay listing endpoint error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: 'Internal server error while creating eBay listing'
    });
  }
});

// Book-specific eBay listing endpoint
app.post("/api/list-book-to-ebay", async (req, res) => {
  try {
    console.log('📖 Received book listing request');
    console.log('📖 Request body keys:', Object.keys(req.body));
    console.log('📖 Book data preview:', {
      title: req.body.title,
      author: req.body.author,
      price: req.body.price,
      condition: req.body.condition,
      hasItemSpecifics: !!req.body.item_specifics,
      hasPhotos: !!req.body.photos,
      photoCount: req.body.photos?.length || 0
    });

    const bookData = req.body;

    // Validate book-specific fields
    if (!bookData.title) {
      return res.status(400).json({
        success: false,
        error: 'Book title is required'
      });
    }

    if (!bookData.author) {
      return res.status(400).json({
        success: false,
        error: 'Book author is required'
      });
    }

    if (!bookData.photos || bookData.photos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Book photos are required'
      });
    }

    // Format book data for eBay API
    const formattedBookListing = {
      title: bookData.title,
      price: parseFloat(bookData.price),
      condition: bookData.condition || 'Used',
      category: bookData.category || 'Books & Magazines > Fiction & Literature',
      description: bookData.description || `${bookData.title} by ${bookData.author}. From a smoke-free home. Fast shipping with tracking.`,
      
      // Book-specific item specifics
      item_specifics: bookData.item_specifics || {
        'Author': bookData.author,
        'Format': bookData.format || 'Hardcover',
        'Language': bookData.language || 'English',
        'Topic': bookData.topic || 'General',
        'Publisher': bookData.publisher || '',
        'Publication Year': bookData.publicationYear || '',
        'ISBN': bookData.isbn || ''
      },
      
      shipping: bookData.shipping || 'USPS Media Mail',
      quantity: parseInt(bookData.quantity) || 1,
      listingType: 'BOOK_ITEM'
    };

    console.log('📖 Formatted book listing for eBay:', {
      title: formattedBookListing.title,
      price: formattedBookListing.price,
      condition: formattedBookListing.condition,
      category: formattedBookListing.category,
      itemSpecificsCount: Object.keys(formattedBookListing.item_specifics).length,
      photoUrls: bookData.photos
    });

    // Create eBay listing using book-specific data
    const ebayResult = await createEbayBookListing(formattedBookListing, bookData.photos);

    if (ebayResult.success) {
      console.log('✅ Book listed successfully on eBay:', ebayResult);
      res.json({
        success: true,
        listingId: ebayResult.listingId,
        itemId: ebayResult.itemId,
        fees: ebayResult.fees,
        message: 'Book listed successfully on eBay',
        bookData: {
          title: formattedBookListing.title,
          author: formattedBookListing.item_specifics.Author,
          price: formattedBookListing.price
        }
      });
    } else {
      console.error('❌ Failed to list book on eBay:', ebayResult);
      res.status(500).json({
        success: false,
        error: ebayResult.error,
        message: ebayResult.message || 'Failed to list book on eBay'
      });
    }

  } catch (error) {
    console.error('❌ Error in book listing endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error while listing book'
    });
  }
});

// Helper function to create eBay listing with pre-hosted URLs
async function createEbayListingWithUrls(listing, hostedPhotoUrls) {
  try {
    const { buildEbayXMLRequest, callEbayTradingAPI, parseEbayResponse } = require('./src/services/ebayApi');
    
    console.log(`📤 Creating eBay listing with ${hostedPhotoUrls.length} pre-hosted photos`);
    
    // Build eBay XML request with pre-hosted photo URLs
    const xmlRequest = buildEbayXMLRequest(listing, hostedPhotoUrls);
    
    // Call eBay Trading API
    const ebayResponse = await callEbayTradingAPI(xmlRequest);
    
    // Parse response and return result
    const parsedResponse = parseEbayResponse(ebayResponse);
    
    // Add photo URLs to response for reference
    parsedResponse.hostedPhotoUrls = hostedPhotoUrls;
    
    return parsedResponse;
  } catch (error) {
    console.error('❌ Error creating eBay listing with URLs:', error);
    return {
      success: false,
      error: error.message,
      message: `Failed to create eBay listing: ${error.message}`
    };
  }
}

// Helper function to create book listing on eBay
async function createEbayBookListing(bookListing, hostedPhotoUrls) {
  try {
    const { buildEbayBookXMLRequest, callEbayTradingAPI, parseEbayResponse } = require('./src/services/ebayApi');
    
    console.log(`📖 Creating eBay book listing with ${hostedPhotoUrls.length} photos`);
    
    // Build book-specific eBay XML request
    const xmlRequest = buildEbayBookXMLRequest(bookListing, hostedPhotoUrls);
    
    // Call eBay Trading API
    const ebayResponse = await callEbayTradingAPI(xmlRequest);
    
    // Parse response and return result
    const parsedResponse = parseEbayResponse(ebayResponse);
    
    // Add book-specific metadata to response
    parsedResponse.hostedPhotoUrls = hostedPhotoUrls;
    parsedResponse.bookData = {
      title: bookListing.title,
      author: bookListing.item_specifics.Author,
      price: bookListing.price,
      isbn: bookListing.item_specifics.ISBN
    };
    
    return parsedResponse;
  } catch (error) {
    console.error('❌ Error creating eBay book listing:', error);
    return {
      success: false,
      error: error.message,
      message: `Failed to create book listing: ${error.message}`
    };
  }
}

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`🚀 Also accessible at http://192.168.1.207:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🤖 OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
});