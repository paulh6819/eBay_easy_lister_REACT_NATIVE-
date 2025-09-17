/**
 * Fun loading messages for posting listings to eBay
 */

export const POSTING_MESSAGES = [
  "🧙‍♂️ Asking the wizard inside our server...",
  "🤖 Negotiating with eBay robots...",
  "📦 Packing your listing with magic dust...",
  "🚀 Launching your item into cyberspace...",
  "💫 Sprinkling some selling sparkles...",
  "🎩 Pulling your listing out of our digital hat...",
  "🔮 Consulting the crystal ball of commerce...",
  "⚡ Charging up the posting lasers...",
  "🎪 Setting up your item's grand debut...",
  "🌟 Making your listing shine like a diamond...",
  "🎭 Rehearsing your item's sales pitch...",
  "🏰 Building a castle for your listing...",
  "🎨 Painting your item in the best light...",
  "🎵 Composing a symphony of selling...",
  "🍕 Delivering your listing fresh and hot...",
  "🎯 Taking aim at the perfect buyer...",
  "🎪 Rolling out the red carpet for your item...",
  "🔥 Firing up the selling engines...",
  "💎 Polishing your listing to perfection...",
  "🎊 Throwing a party for your new listing..."
];

/**
 * Get a random posting message
 */
export const getRandomPostingMessage = () => {
  const randomIndex = Math.floor(Math.random() * POSTING_MESSAGES.length);
  return POSTING_MESSAGES[randomIndex];
};

/**
 * Processing messages for OpenAI listing generation
 */
export const PROCESSING_MESSAGES = [
  "🤖 Creating listing with AI magic...",
  "🔍 Teaching robots to read your photos...",
  "📸 Analyzing pixels like a detective...",
  "🧠 Putting our AI brain to work...",
  "✨ Brewing up the perfect listing...",
  "🎯 Aiming for listing perfection...",
  "🔮 Reading the fortune in your photos...",
  "🧪 Mixing the perfect listing potion..."
];

export const getRandomProcessingMessage = () => {
  const randomIndex = Math.floor(Math.random() * PROCESSING_MESSAGES.length);
  return PROCESSING_MESSAGES[randomIndex];
};