export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    // Get the API key from environment variable
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      console.error('GOOGLE_MAPS_API_KEY environment variable not set');
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    console.log('Returning API key to authenticated user');

    // Return the API key to authenticated users
    return res.status(200).json({ 
      apiKey: GOOGLE_MAPS_API_KEY,
      success: true 
    });
  } catch (error) {
    console.error('Error in get-api-key function:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
