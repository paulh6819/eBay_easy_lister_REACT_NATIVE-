/**
 * Test connection to server
 */

// Try multiple URLs that work in different environments
const TEST_URLS = [
  'http://192.168.1.207:3000', // Your local network IP
  'http://127.0.0.1:3000',
  'http://localhost:3000',
];

export const testServerConnection = async () => {
  for (const url of TEST_URLS) {
    try {
      console.log(`🔍 Testing connection to: ${url}`);
      
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        timeout: 5000,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Connected successfully to: ${url}`, data);
        return { success: true, url, data };
      }
    } catch (error) {
      console.log(`❌ Failed to connect to: ${url}`, error.message);
    }
  }
  
  return { success: false, error: 'Could not connect to any server URL' };
};