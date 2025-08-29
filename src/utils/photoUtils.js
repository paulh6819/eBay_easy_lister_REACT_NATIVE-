/**
 * Utility functions for photo processing and management
 */

/**
 * Group photos based on photos per listing setting
 * @param {Array} photos - Array of photo objects
 * @param {number|string} photosPerListing - Number of photos per listing or 'auto'
 * @returns {Array} Array of photo groups
 */
export const groupPhotos = (photos, photosPerListing) => {
  if (!photos || photos.length === 0) {
    return [];
  }

  if (photosPerListing === 'auto') {
    return autoDetectGroups(photos);
  }

  const groups = [];
  for (let i = 0; i < photos.length; i += photosPerListing) {
    groups.push(photos.slice(i, i + photosPerListing));
  }
  return groups;
};

/**
 * Auto-detect photo groups based on image similarity
 * Currently returns single group - implement ML-based grouping later
 * @param {Array} photos - Array of photo objects
 * @returns {Array} Array of photo groups
 */
const autoDetectGroups = (photos) => {
  return [photos];
};

/**
 * Calculate estimated number of listings
 * @param {number} photoCount - Total number of photos
 * @param {number|string} photosPerListing - Photos per listing
 * @returns {number|string} Estimated listing count
 */
export const calculateEstimatedListings = (photoCount, photosPerListing) => {
  if (photosPerListing === 'auto') {
    return '?';
  }
  return Math.ceil(photoCount / photosPerListing);
};

/**
 * Resize image for optimal upload
 * @param {string} uri - Image URI
 * @param {Object} options - Resize options
 * @returns {Promise} Resized image URI
 */
export const resizeImage = async (uri, options = {}) => {
  const { width = 1200, height = 1200, quality = 0.8 } = options;
  
  // This would integrate with expo-image-manipulator in a real implementation
  // For now, return original URI
  return uri;
};

/**
 * Validate photo for eBay requirements
 * @param {Object} photo - Photo object with width, height, size
 * @returns {Object} Validation result
 */
export const validatePhoto = (photo) => {
  const errors = [];
  const warnings = [];
  
  // eBay photo requirements
  const MIN_SIZE = 500;
  const MAX_SIZE = 12 * 1024 * 1024; // 12MB
  const RECOMMENDED_MIN = 1600;
  
  if (photo.width < MIN_SIZE || photo.height < MIN_SIZE) {
    errors.push('Photo must be at least 500x500 pixels');
  }
  
  if (photo.size && photo.size > MAX_SIZE) {
    errors.push('Photo size must be less than 12MB');
  }
  
  if (photo.width < RECOMMENDED_MIN || photo.height < RECOMMENDED_MIN) {
    warnings.push('Photo should be at least 1600x1600 pixels for best quality');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Generate thumbnail from photo
 * @param {string} uri - Photo URI
 * @param {number} size - Thumbnail size
 * @returns {Promise} Thumbnail URI
 */
export const generateThumbnail = async (uri, size = 150) => {
  // This would use expo-image-manipulator to create thumbnail
  // For now, return original URI
  return uri;
};

/**
 * Extract EXIF data from photo
 * @param {string} uri - Photo URI
 * @returns {Promise} EXIF data object
 */
export const extractExifData = async (uri) => {
  // This would extract EXIF data for auto-rotation and metadata
  // For now, return empty object
  return {};
};