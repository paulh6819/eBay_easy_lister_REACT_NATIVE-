const API_BASE_URL = 'http://localhost:3000/api';

/**
 * API service for backend communication
 */
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Make HTTP request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Analyze photos to generate listing data
   * @param {Array} photoGroups - Array of photo groups
   * @param {Object} options - Analysis options
   * @returns {Promise} Generated listings
   */
  async analyzePhotos(photoGroups, options = {}) {
    const formData = new FormData();
    
    photoGroups.forEach((group, groupIndex) => {
      group.forEach((photo, photoIndex) => {
        formData.append(`group_${groupIndex}_photo_${photoIndex}`, {
          uri: photo.uri,
          type: 'image/jpeg',
          name: `photo_${groupIndex}_${photoIndex}.jpg`,
        });
      });
    });
    
    formData.append('options', JSON.stringify(options));
    
    return this.request('/analyze', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Post listing to eBay
   * @param {Object} listing - Listing data
   * @returns {Promise} eBay listing response
   */
  async postToEbay(listing) {
    return this.request('/list', {
      method: 'POST',
      body: JSON.stringify(listing),
    });
  }

  /**
   * Get saved templates
   * @returns {Promise} Array of templates
   */
  async getTemplates() {
    return this.request('/templates');
  }

  /**
   * Save new template
   * @param {Object} template - Template data
   * @returns {Promise} Saved template
   */
  async saveTemplate(template) {
    return this.request('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  /**
   * Update existing template
   * @param {string} templateId - Template ID
   * @param {Object} template - Updated template data
   * @returns {Promise} Updated template
   */
  async updateTemplate(templateId, template) {
    return this.request(`/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  /**
   * Delete template
   * @param {string} templateId - Template ID
   * @returns {Promise} Deletion response
   */
  async deleteTemplate(templateId) {
    return this.request(`/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get sold listings for reference
   * @returns {Promise} Array of sold listings
   */
  async getSoldListings() {
    return this.request('/sold-listings');
  }
}

export default new ApiService();