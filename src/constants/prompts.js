/**
 * AI prompts and configuration constants
 */

export const AI_PROMPTS = {
  GENERAL_ITEM: `
    Analyze the provided photos of an item and generate eBay listing data in JSON format.
    
    Instructions:
    - Create a compelling title under 80 characters
    - Write a detailed description highlighting key features and condition
    - Suggest appropriate category based on the item
    - Estimate fair market price based on item condition and type
    - Set appropriate condition (New, Like New, Very Good, Good, Acceptable)
    - Include relevant keywords for searchability
    
    Return JSON with: title, description, price, category, condition, keywords
  `,
  
  BOOK_ITEM: (imageCount) => `You are
   an API that generates eBay listing metadata from
   images of books. I am providing ${imageCount} 
  photo(s) of the same book from different angles 
  (front cover, back cover, spine, pages, etc.). 

  Analyze ALL the provided photos together to 
  extract comprehensive information about this 
  book. Use details from the front cover, back 
  cover, spine, copyright page, and any visible 
  text to get the most accurate information.

  Your goal is to create an optimized listing with 
  searchable metadata for selling used books on 
  eBay. Focus on clear, keyword-rich titles, 
  accurate pricing based on condition visible in 
  photos, detailed condition assessment from 
  multiple angles, and compelling descriptions.

  IMPORTANT: Never use "Like New" condition. If the
   book appears to be in excellent condition, use 
  "Very Good" instead. The condition hierarchy is: 
  Very Good > Good > Acceptable.

  Return your answer in the following JSON format:

  {
    "title": "[Full eBay title with author and 
  subtitle if visible]",
    "price": [Number like 12.99, based on condition
   and book type],
    "condition": "[Very Good | Good | Acceptable]",
    "category": "[Best eBay category based on the 
  book topic]",
    "item_specifics": {
      "Author": "[Author name from cover or 
  spine]",
      "Format": "[Hardcover | Paperback]",
      "Language": "[English, etc.]",
      "Topic": "[Art, History, Sci-Fi, etc. based 
  on content]",
      "Publisher": "[Publisher if visible on spine 
  or copyright]",
      "Publication Year": "[Year if visible]",
      "ISBN": "[If visible on back cover or 
  copyright page]"
    },
    "description": "[4-6 sentence HTML-safe 
  description. Include book summary if visible, 
  condition assessment from photos, and marketing 
  phrases like 'Money-back guaranteed', 'From a 
  smoke-free home', 'Fast shipping']",
    "shipping": "USPS Media Mail",
    "return_policy": "30-day returns accepted, 
  buyer pays return shipping",
    "listing_duration": "GTC"
  }

  Only return the JSON. No preamble or follow-up 
  message.`,
  
  ELECTRONICS: `
    Analyze the provided photos of an electronic item and generate eBay listing data.
    
    Instructions:
    - Identify brand, model, and specifications
    - Assess cosmetic and functional condition
    - Include model numbers, serial numbers if visible
    - Mention included accessories and cables
    - Research current market value
    - Note any signs of wear, scratches, or damage
    
    Return JSON with: title, description, price, category, condition, brand, model, specifications
  `,
  
  CLOTHING: `
    Analyze the provided photos of clothing and generate eBay listing data.
    
    Instructions:
    - Identify brand, size, and style
    - Assess condition noting any stains, tears, or wear
    - Create appealing title with brand, item type, and size
    - Include material and care instructions if visible on labels
    - Price based on brand value and condition
    - Mention measurements if size is unclear
    
    Return JSON with: title, description, price, category, condition, brand, size, material
  `
};

export const CATEGORY_MAPPINGS = {
  'Books': [
    'Books',
    'Textbooks, Education & Reference',
    'Fiction & Literature',
    'Children & Young Adults'
  ],
  'Electronics': [
    'Cell Phones & Accessories',
    'Computers/Tablets & Networking',
    'Consumer Electronics',
    'Video Games & Consoles'
  ],
  'Clothing': [
    'Clothing, Shoes & Accessories',
    'Women\'s Clothing',
    'Men\'s Clothing',
    'Kids & Baby'
  ],
  'Home': [
    'Home & Garden',
    'Home Décor',
    'Kitchen, Dining & Bar',
    'Furniture'
  ],
  'Collectibles': [
    'Collectibles',
    'Toys & Hobbies',
    'Art',
    'Antiques'
  ]
};

export const CONDITION_MAPPINGS = {
  'new': 'New',
  'like_new': 'New other (see details)',
  'very_good': 'Used',
  'good': 'Used',
  'acceptable': 'For parts or not working'
};

export const SHIPPING_OPTIONS = {
  'standard': {
    name: 'Standard Shipping',
    price: 0,
    days: '3-5 business days'
  },
  'expedited': {
    name: 'Expedited Shipping',
    price: 5.99,
    days: '1-3 business days'
  },
  'overnight': {
    name: 'Overnight Shipping',
    price: 19.99,
    days: 'Next business day'
  },
  'free': {
    name: 'Free Standard Shipping',
    price: 0,
    days: '3-7 business days'
  }
};