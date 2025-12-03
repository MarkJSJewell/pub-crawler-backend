const axios = require('axios');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get the authorization token
    const authHeader = event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No authorization token provided' }),
      };
    }

    // TODO: Verify the Firebase token here
    // For now, we'll accept any token (you'll add Firebase verification later)

    // Parse request body
    const { location, radius, type, keyword } = JSON.parse(event.body);

    // Your Google Maps API key (stored in Netlify environment variables)
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' }),
      };
    }

    // Build the Google Places API request
    const params = {
      location: location,
      radius: radius,
      key: GOOGLE_MAPS_API_KEY,
    };

    if (type) params.type = type;
    if (keyword) params.keyword = keyword;

    // Call Google Places API
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      { params }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
    };
  }
};
