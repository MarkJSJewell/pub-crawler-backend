// ============================================
// File: api/search-places.js
// Complete implementation with Place Details API
// ============================================

import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Firebase token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    await admin.auth().verifyIdToken(token);

    const { location, radius, type, keyword } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    console.log('Starting text search...');
    
    // STEP 1: Text Search to find places
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.editorialSummary'
      },
      body: JSON.stringify({
        textQuery: keyword || type || 'pub',
        locationBias: {
          circle: {
            center: {
              latitude: parseFloat(location.split(',')[0]),
              longitude: parseFloat(location.split(',')[1])
            },
            radius: parseFloat(radius) || 5000
          }
        },
        maxResultCount: 20
      })
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Search failed:', searchResponse.status, errorText);
      throw new Error(`Search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.places || searchData.places.length === 0) {
      console.log('No places found in text search');
      return res.status(200).json({ places: [] });
    }

    console.log(`Found ${searchData.places.length} places, fetching details...`);

    // STEP 2: Fetch Place Details for each place to get allowsDogs and other attributes
    const placesWithDetails = await Promise.all(
      searchData.places.map(async (place) => {
        try {
          // The place.id from searchText is the resource name like "places/ChIJ..."
          // We need to use it directly
          const placeId = place.id.replace('places/', '');
          const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}`;
          
          console.log(`Fetching details for: ${place.displayName?.text}`);
          
          const detailsResponse = await fetch(detailsUrl, {
            method: 'GET',
            headers: {
              'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
              'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,userRatingCount,types,editorialSummary,allowsDogs,outdoorSeating,goodForWatchingSports,servesBeer,servesWine,servesCocktails,goodForGroups,menuForChildren,restroom,paymentOptions,accessibilityOptions'
            }
          });

          if (detailsResponse.ok) {
            const details = await detailsResponse.json();
            
            console.log(`${place.displayName?.text}: allowsDogs=${details.allowsDogs}, outdoorSeating=${details.outdoorSeating}, goodForWatchingSports=${details.goodForWatchingSports}`);
            
            return {
              ...place,
              allowsDogs: details.allowsDogs || false,
              outdoorSeating: details.outdoorSeating || false,
              goodForWatchingSports: details.goodForWatchingSports || false,
              servesBeer: details.servesBeer || false,
              servesWine: details.servesWine || false,
              servesCocktails: details.servesCocktails || false,
              goodForGroups: details.goodForGroups || false
            };
          } else {
            console.error(`Failed to fetch details for ${place.displayName?.text}: ${detailsResponse.status}`);
          }
          
          // If details fetch fails, return original place data with defaults
          return {
            ...place,
            allowsDogs: false,
            outdoorSeating: false,
            goodForWatchingSports: false,
            servesBeer: false,
            servesWine: false,
            servesCocktails: false,
            goodForGroups: false
          };
        } catch (error) {
          console.error(`Error fetching details for place ${place.id}:`, error);
          return {
            ...place,
            allowsDogs: false,
            outdoorSeating: false,
            goodForWatchingSports: false,
            servesBeer: false,
            servesWine: false,
            servesCocktails: false,
            goodForGroups: false
          };
        }
      })
    );

    console.log(`Returning ${placesWithDetails.length} places with details`);

    return res.status(200).json({ 
      places: placesWithDetails,
      status: 'OK' 
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    });
  }
}

// ============================================
// ENVIRONMENT VARIABLES NEEDED:
// ============================================
// GOOGLE_MAPS_API_KEY
// FIREBASE_PROJECT_ID
// FIREBASE_CLIENT_EMAIL  
// FIREBASE_PRIVATE_KEY
// ============================================