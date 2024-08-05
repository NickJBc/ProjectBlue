// Import node-fetch for server-side fetch
import fetch from 'node-fetch';

// Define headers to allow CORS
const HEADERS = {
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin',
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*', // Allow any origin for development
  'Access-Control-Max-Age': '8640',
  'Vary': 'Origin'
};

export async function handler(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    // Handle CORS preflight request
    return {
      statusCode: 204,
      headers: HEADERS
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);

      // Call the Binance API
      const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body) // Forward the request body
      });

      // Process the response from Binance
      const data = await response.json();

      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify(data)
      };
    } catch (error) {
      console.error('Error calling Binance API:', error);
      return {
        statusCode: 500,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Failed to fetch data from Binance' })
      };
    }
  }

  return {
    statusCode: 405, // Method Not Allowed
    headers: HEADERS,
    body: JSON.stringify({ error: 'Method Not Allowed' })
  };
}
