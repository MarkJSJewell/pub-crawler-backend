# Pub Crawler Backend

A secure serverless backend for the Historic Pub Crawler app that hides your Google Maps API key and requires user authentication.

## Features

- ✅ **Serverless Functions** - Scales automatically, pay only for what you use
- ✅ **Hidden API Key** - Your Google Maps API key is never exposed to users
- ✅ **User Authentication** - Requires Firebase authentication token
- ✅ **CORS Enabled** - Works with web apps from any domain
- ✅ **FREE Hosting** - Netlify free tier (125k requests/month)

## Endpoints

### 1. Search Places
**POST** `/.netlify/functions/search-places`

Search for pubs, bars, and venues near a location.

**Request:**
```json
{
  "location": "51.5074,-0.1278",
  "radius": 5000,
  "type": "bar",
  "keyword": "pub"
}
```

### 2. Place Details
**POST** `/.netlify/functions/place-details`

Get detailed information about a specific place.

**Request:**
```json
{
  "place_id": "ChIJ..."
}
```

### 3. Directions
**POST** `/.netlify/functions/directions`

Calculate walking routes between venues.

**Request:**
```json
{
  "origin": "51.5074,-0.1278",
  "destination": "51.5155,-0.1410",
  "waypoints": "optimize:true|51.5145,-0.1390|51.5120,-0.1350",
  "mode": "walking"
}
```

## Setup

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete setup instructions.

**Quick Start:**
1. Deploy to Netlify (drag & drop this folder)
2. Add `GOOGLE_MAPS_API_KEY` environment variable
3. Set up Firebase Authentication
4. Update your web app to use this backend

## Authentication

All endpoints require a Firebase authentication token in the Authorization header:

```
Authorization: Bearer {firebase-token}
```

## Environment Variables

Set these in Netlify:

- `GOOGLE_MAPS_API_KEY` - Your Google Maps API key

## Local Development

To test locally:

```bash
npm install netlify-cli -g
netlify dev
```

Set environment variables in `.env`:
```
GOOGLE_MAPS_API_KEY=your_key_here
```

## Security

- API key is stored server-side only
- Authentication required for all endpoints
- CORS configured for security
- No sensitive data exposed to clients

## Cost

**Netlify Free Tier:**
- 125,000 requests/month
- 100GB bandwidth/month
- More than enough for most pub crawl apps!

**Google Maps API:**
- Places API: $17 per 1,000 requests (after free $200/month credit)
- Directions API: $5 per 1,000 requests (after free credit)
- With typical usage, you'll likely stay within free tier

## Tech Stack

- **Runtime:** Node.js
- **Functions:** Netlify Serverless Functions
- **HTTP Client:** Axios
- **Authentication:** Firebase Auth (token verification)

## License

MIT

## Author

Mark Jewell

## Support

For issues or questions, see the DEPLOYMENT_GUIDE.md file.
