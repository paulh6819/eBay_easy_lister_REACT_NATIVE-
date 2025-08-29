/**
 * Book-specific listing service for eBay posting
 */

const API_BASE_URL = 'http://192.168.1.207:3000';

/**
 * Post a single book listing to eBay
 * @param {Object} bookData - Book listing data
 * @returns {Promise<Object>} eBay posting result
 */
export const postBookToEbay = async (bookData) => {
  try {
    console.log('📖 Posting book to eBay:', bookData.id);
    console.log('📖 Full book data:', {
      title: bookData.title,
      author: bookData.author,
      price: bookData.price,
      condition: bookData.condition,
      hasHostedPhotos: !!bookData.hostedPhotos,
      hostedPhotoCount: bookData.hostedPhotos?.length || 0
    });

    // Validate book data before posting
    const validationResult = validateBookListing(bookData);
    if (!validationResult.isValid) {
      throw new Error(`Book validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Check for hosted photos
    if (!bookData.hostedPhotos || bookData.hostedPhotos.length === 0) {
      console.log('⚠️ No hosted photos found for book, checking for regular photos as fallback...');
      
      if (bookData.photos && bookData.photos.length > 0) {
        throw new Error('Photos are not hosted yet. Please try regenerating the listing or wait for photos to upload to GameSighter.');
      } else {
        throw new Error('No photos available - book listing requires photos for eBay posting');
      }
    }

    // Format book data for eBay API
    const formattedBookData = formatBookDataForEbay(bookData);

    // Use dedicated book endpoint
    const response = await fetch(`${API_BASE_URL}/api/list-book-to-ebay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedBookData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Book posted successfully:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error posting book listing:', error);
    throw error;
  }
};

/**
 * Post multiple book listings to eBay
 * @param {Array} bookListings - Array of book listing data
 * @returns {Promise<Object>} Batch posting results
 */
export const postBooksToEbay = async (bookListings) => {
  try {
    console.log(`📚 Posting ${bookListings.length} books to eBay...`);
    
    const results = [];
    const errors = [];

    for (let i = 0; i < bookListings.length; i++) {
      const book = bookListings[i];
      try {
        console.log(`📖 Posting book ${i + 1}/${bookListings.length}: ${book.title}`);
        const result = await postBookToEbay(book);
        results.push({
          id: book.id,
          title: book.title,
          success: true,
          result: result
        });
      } catch (error) {
        console.error(`❌ Failed to post book ${book.title}:`, error.message);
        errors.push({
          id: book.id,
          title: book.title,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`✅ Book batch posting complete: ${results.length} successful, ${errors.length} failed`);
    
    return {
      successful: results,
      failed: errors,
      totalProcessed: bookListings.length,
      successCount: results.length,
      errorCount: errors.length
    };
  } catch (error) {
    console.error('❌ Error in batch book posting:', error);
    throw error;
  }
};

/**
 * Validate book listing data
 * @param {Object} bookData - Book data to validate
 * @returns {Object} Validation result
 */
export const validateBookListing = (bookData) => {
  const errors = [];

  // Required fields
  if (!bookData.title || bookData.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!bookData.author || bookData.author.trim() === '') {
    errors.push('Author is required');
  }

  if (!bookData.price || bookData.price <= 0) {
    errors.push('Valid price is required');
  }

  // Book-specific validation
  if (bookData.isbn && !isValidISBN(bookData.isbn)) {
    errors.push('Invalid ISBN format');
  }

  // Book condition validation (books don't use "Like New")
  const validConditions = ['Very Good', 'Good', 'Acceptable'];
  if (bookData.condition && !validConditions.includes(bookData.condition)) {
    errors.push(`Invalid condition for books. Must be: ${validConditions.join(', ')}`);
  }

  // Photo validation
  if (!bookData.hostedPhotos || bookData.hostedPhotos.length === 0) {
    errors.push('Hosted photos are required');
  }

  // Category validation (should be book-related)
  if (bookData.category && !bookData.category.toLowerCase().includes('book')) {
    errors.push('Category should be book-related');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Format book data for eBay API
 * @param {Object} bookData - Raw book data
 * @returns {Object} Formatted data for eBay
 */
export const formatBookDataForEbay = (bookData) => {
  return {
    // Basic listing info
    title: bookData.title,
    price: parseFloat(bookData.price),
    condition: mapBookConditionToEbay(bookData.condition),
    category: bookData.category || 'Books & Magazines > Fiction & Literature',
    description: formatBookDescription(bookData),
    
    // Book-specific item specifics
    item_specifics: {
      'Book Title': bookData.bookTitle || extractBookTitleFromFull(bookData.title),
      'Author': bookData.author,
      'Format': bookData.format || 'Hardcover',
      'Language': bookData.language || 'English',
      'Topic': bookData.topic || 'General',
      'Publisher': bookData.publisher || '',
      'Publication Year': bookData.publicationYear || '',
      'ISBN': formatISBN(bookData.isbn) || '',
      'Edition': bookData.edition || '1st Edition',
      'Series': bookData.series || '',
      'Reading Level': bookData.readingLevel || 'Adult',
      'Number of Pages': bookData.numberOfPages || '',
      'Special Features': bookData.specialFeatures || ''
    },
    
    // Shipping and inventory
    shipping: bookData.shipping || 'USPS Media Mail',
    quantity: parseInt(bookData.quantity) || 1,
    
    // Photos (hosted URLs)
    photos: bookData.hostedPhotos.map(photo => photo.url),
    
    // Metadata
    id: bookData.id,
    listingType: 'BOOK_ITEM'
  };
};

/**
 * Map book condition to eBay condition
 * @param {string} condition - Book condition
 * @returns {string} eBay condition
 */
const mapBookConditionToEbay = (condition) => {
  const conditionMap = {
    'Very Good': 'Used',
    'Good': 'Used',
    'Acceptable': 'Acceptable'
  };
  
  return conditionMap[condition] || 'Used';
};

/**
 * Format book description with book-specific elements
 * @param {Object} bookData - Book data
 * @returns {string} Formatted description
 */
const formatBookDescription = (bookData) => {
  let description = bookData.description || '';
  
  // Add book-specific details if not already in description
  const bookDetails = [];
  
  if (bookData.author && !description.toLowerCase().includes(bookData.author.toLowerCase())) {
    bookDetails.push(`Author: ${bookData.author}`);
  }
  
  if (bookData.format) {
    bookDetails.push(`Format: ${bookData.format}`);
  }
  
  if (bookData.publisher) {
    bookDetails.push(`Publisher: ${bookData.publisher}`);
  }
  
  if (bookData.publicationYear) {
    bookDetails.push(`Publication Year: ${bookData.publicationYear}`);
  }
  
  if (bookData.isbn) {
    bookDetails.push(`ISBN: ${bookData.isbn}`);
  }

  // Standard book selling phrases
  const standardPhrases = [
    'From a smoke-free home',
    'Fast shipping with tracking',
    'Money-back guarantee',
    'Media Mail shipping available'
  ];

  if (bookDetails.length > 0) {
    description += '\n\n' + bookDetails.join(' | ');
  }

  if (!description.toLowerCase().includes('smoke-free')) {
    description += '\n\n' + standardPhrases.join(' | ');
  }

  return description.trim();
};

/**
 * Validate ISBN format
 * @param {string} isbn - ISBN to validate
 * @returns {boolean} Is valid ISBN
 */
const isValidISBN = (isbn) => {
  if (!isbn) return true; // ISBN is optional
  
  const cleaned = isbn.replace(/[-\s]/g, '');
  return /^\d{10}$/.test(cleaned) || /^\d{13}$/.test(cleaned);
};

/**
 * Format ISBN for display
 * @param {string} isbn - Raw ISBN
 * @returns {string} Formatted ISBN
 */
const formatISBN = (isbn) => {
  if (!isbn) return '';
  
  const cleaned = isbn.replace(/[-\s]/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{5})(\d{1})/, '$1-$2-$3-$4');
  } else if (cleaned.length === 13) {
    return cleaned.replace(/(\d{3})(\d{1})(\d{3})(\d{5})(\d{1})/, '$1-$2-$3-$4-$5');
  }
  
  return isbn;
};

/**
 * Extract book title from full title (removing author)
 * @param {string} fullTitle - Full title including author
 * @returns {string} Book title only
 */
const extractBookTitleFromFull = (fullTitle) => {
  if (!fullTitle) return '';
  
  // Common patterns: "Title by Author" or "Title: Subtitle by Author"
  const byPattern = / by /i;
  if (byPattern.test(fullTitle)) {
    return fullTitle.split(byPattern)[0].trim();
  }
  
  // If no "by" pattern, return full title
  return fullTitle;
};