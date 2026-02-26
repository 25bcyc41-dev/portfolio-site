# Vercel Deployment Guide

This project is now fully compatible with Vercel deployment. Follow these steps to deploy:

## Deployment Steps

1. **Push to GitHub** (already done):
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository `25bcyc41-dev/portfolio-site`
   - Vercel will auto-detect settings from `vercel.json`
   - Click "Deploy"

3. **Your site will be live at**: `https://portfolio-site.vercel.app`

## Project Structure (Vercel-Ready)

```
portfolio-project/
├── api/                    # Serverless API functions
│   ├── auth.js            # Login endpoint
│   ├── contact.js         # Contact form submission
│   └── messages.js        # Retrieve messages (requires auth)
├── public/                 # Static files (HTML, CSS, JS)
│   ├── index.html
│   ├── reports.html
│   ├── script.js
│   └── style.css
├── data/                   # Messages storage (local dev only)
│   └── messages.json
├── vercel.json            # Vercel configuration
├── dev-server.js          # Local development server
└── package.json
```

## How It Works

### Local Development
```bash
npm run dev
# Server runs on http://localhost:3000
# Dev server automatically handles API routing
```

### Vercel Production
- API requests: `/api/auth`, `/api/contact`, `/api/messages`
- Static files served from `/public` directory
- Automatically handles routing with the config in `vercel.json`

## API Endpoints

All endpoints automatically work on both localhost and Vercel:

### POST `/api/auth`
Login endpoint for reports dashboard
```json
{
  "username": "admin",
  "password": "password123"
}
```

### POST `/api/contact`
Submit contact form
```json
{
  "name": "Your Name",
  "email": "your@email.com",
  "message": "Your message"
}
```

### GET `/api/messages`
Retrieve all messages (requires Bearer token)
```
Authorization: Bearer <base64(admin:password123)>
```

## Important Notes

### Data Persistence
- **Local Development**: Messages persist in `data/messages.json`
- **Vercel**: Vercel uses an ephemeral filesystem - data written during execution is lost when the function completes
  
**For production persistence, you'll need**:
- Database (MongoDB, PostgreSQL, Firebase, etc.)
- External storage (S3, etc.)

### Future Enhancement
To use a proper database on Vercel, update the `saveMessage()` and `getMessages()` functions in:
- `api/contact.js`
- `api/messages.js`

Example with MongoDB:
```javascript
import { MongoClient } from 'mongodb';

// Replace file operations with database calls
async function getMessages() {
  const client = await MongoClient.connect(process.env.MONGO_URI);
  const db = client.db('portfolio');
  return await db.collection('messages').find({}).toArray();
}
```

## Environment Variables

Currently, credentials are hardcoded:
- Username: `admin`
- Password: `password123`

For production, add to Vercel:
1. Go to Project Settings → Environment Variables
2. Add your configuration

## CORS

CORS is enabled for all origins - suitable for development. For production:
- Limit `Access-Control-Allow-Origin` to your domain
- Update in `api/*.js` files

## Next Steps

1. ✅ Apply changes and verify locally: `npm run dev`
2. ✅ Push to GitHub: `git push origin main`
3. ✅ Deploy to Vercel via vercel.com dashboard
4. 📊 Monitor logs in Vercel dashboard if issues occur
5. 🔄 For data persistence: Integrate a database service
