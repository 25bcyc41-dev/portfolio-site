# Portfolio Project

A modern, serverless portfolio website optimized for Vercel deployment.

## 📁 Project Structure

```
├── api/                 # Vercel serverless functions
│   ├── contact.js      # Handle contact form submissions
│   └── messages.js     # Retrieve contact messages
├── public/             # Static files (HTML, CSS, JS)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── package.json        # Node.js dependencies
├── vercel.json         # Vercel deployment config
└── .gitignore          # Git ignore rules
```

## 🚀 Deployment to Vercel

### Prerequisites
- GitHub account with this repository
- Vercel account (free at [vercel.com](https://vercel.com))

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Restructure for Vercel deployment"
   git push origin main
   ```

2. **Deploy with Vercel**
   - Go to [vercel.com/import](https://vercel.com/import)
   - Select your GitHub repository
   - Click "Deploy"
   - Your site will be live in seconds! ✨

### Alternative: CLI Deployment
```bash
npm install -g vercel
vercel
```

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server (local testing)
npx vercel dev

# Or simply open public/index.html in a browser for frontend testing
```

## 📝 API Endpoints

### POST `/api/contact`
Submit a contact form message.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Your message here"
}
```

**Response:**
```json
{
  "message": "Message saved successfully ✅",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Your message here",
    "timestamp": "2024-02-26T10:00:00.000Z"
  }
}
```

### GET `/api/messages`
Retrieve all contact messages.

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Your message here",
    "timestamp": "2024-02-26T10:00:00.000Z"
  }
]
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for local development (not tracked in git):
```
# Example (optional for this basic setup)
```

## 📚 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js Serverless Functions (Vercel)
- **Database:** JSON file storage (can upgrade to MongoDB, PostgreSQL, etc.)
- **Hosting:** Vercel

## 🎨 Customization

### Update Portfolio Content
Edit `/public/index.html` to customize:
- Your name and title
- About section
- Skills and proficiency levels
- Social links

### Update Styling
Modify `/public/style.css` to change:
- Colors
- Fonts
- Animations
- Layout

## 📊 Database Upgrade Options

For production use, consider upgrading to:
- **MongoDB Atlas** (free tier available)
- **PostgreSQL** with Vercel Postgres
- **Supabase** (free PostgreSQL)

## 🛠️ Troubleshooting

### Messages not saving?
- Check browser console for errors
- Verify API endpoint in `/public/script.js`
- Ensure `/data` directory has write permissions

### Styling issues after deployment?
- Clear browser cache
- Verify all CSS paths use `/` prefix

## 📄 License

MIT - Feel free to use this project as a template!

## 📮 Support

For issues or questions, check Vercel docs: [vercel.com/docs](https://vercel.com/docs)
