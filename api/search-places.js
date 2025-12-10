import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { location, radius, type, keyword } = req.body;

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: keyword || type,
        locationBias: {
          circle: {
            center: {
              latitude: parseFloat(location.split(',')[0]),
              longitude: parseFloat(location.split(',')[1])
            },
            radius: parseInt(radius)
          }
        },
        rankPreference: 'DISTANCE',
        maxResultCount: 20
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.editorialSummary,places.primaryType'
        }
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
