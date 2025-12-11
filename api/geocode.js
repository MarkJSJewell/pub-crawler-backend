// ============================================
// File: api/geocode.js
// Vercel Serverless Function for Geocoding
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

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Firebase authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      await admin.auth().verifyIdToken(token);
    } catch (authError) {
      console.error('Token verification failed:', authError);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Get address from request body
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Address is required' 
      });
    }

    // Get Google Maps API key from environment variables
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'API key not configured' 
      });
    }

    // Call Google Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const geocodeResponse = await fetch(geocodeUrl);
    
    if (!geocodeResponse.ok) {
      throw new Error(`Geocoding API request failed: ${geocodeResponse.status}`);
    }

    const geocodeData = await geocodeResponse.json();

    // Return the geocoding results
    if (geocodeData.status === 'OK') {
      return res.status(200).json({
        status: 'OK',
        results: geocodeData.results
      });
    } else {
      // Handle various Google API error statuses
      let errorMessage = 'Geocoding failed';
      
      switch (geocodeData.status) {
        case 'ZERO_RESULTS':
          errorMessage = 'No results found for this address';
          break;
        case 'OVER_QUERY_LIMIT':
          errorMessage = 'API quota exceeded';
          break;
        case 'REQUEST_DENIED':
          errorMessage = 'Geocoding request denied';
          break;
        case 'INVALID_REQUEST':
          errorMessage = 'Invalid geocoding request';
          break;
        case 'UNKNOWN_ERROR':
          errorMessage = 'Server error, please try again';
          break;
      }

      return res.status(200).json({
        status: geocodeData.status,
        error: errorMessage,
        results: []
      });
    }

  } catch (error) {
    console.error('Geocoding error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// ============================================
// ENVIRONMENT VARIABLES NEEDED IN VERCEL:
// ============================================
// 
// GOOGLE_MAPS_API_KEY=your_google_maps_api_key
// FIREBASE_PROJECT_ID=your_firebase_project_id
// FIREBASE_CLIENT_EMAIL=your_firebase_client_email
// FIREBASE_PRIVATE_KEY=your_firebase_private_key
//
// ============================================