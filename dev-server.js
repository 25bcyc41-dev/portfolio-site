import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// Initialize MongoDB client
const mongoUri = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  
  try {
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
    });
    
    await client.connect();
    const db = client.db('portfolio');
    
    cachedClient = client;
    cachedDb = db;
    
    console.log('✅ Connected to MongoDB');
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

// Helper to validate token
function validateToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  // Token format: Bearer <base64(username:password)>
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const expectedToken = Buffer.from('admin:password123').toString('base64');
  return token === expectedToken;
}

// Demo credentials
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'password123';

// Helper to get messages
async function getMessages() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('messages');
    
    const messages = await collection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    return [];
  }
}

// Helper to save message
async function saveMessage(name, email, message) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('messages');
    
    const result = await collection.insertOne({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      timestamp: new Date()
    });
    
    const newMessage = {
      id: result.insertedId.toString(),
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    console.log(`[Saved] Message stored in MongoDB`);
    return newMessage;
  } catch (error) {
    console.error('Error saving message:', error.message);
    throw error;
  }
}

// Serve static file with correct MIME type
function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const contentType = mimeTypes[ext] || 'text/plain';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404: File not found');
  }
}

// Create server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API: Authentication
  if (pathname === '/api/auth' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);

        if (!username || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Missing username or password'
          }));
          return;
        }

        if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
          const token = Buffer.from(`${username}:${password}`).toString('base64');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'Login successful ✅',
            token: token
          }));
          return;
        }

        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Invalid username or password'
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }

  // API: Contact form
  if (pathname === '/api/contact' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { name, email, message } = JSON.parse(body);

        if (!name || !email || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Missing required fields: name, email, message'
          }));
          return;
        }

        const saved = await saveMessage(name, email, message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Message saved successfully ✅',
          data: saved
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }

  // API: Get messages (requires authentication)
  if (pathname === '/api/messages' && req.method === 'GET') {
    (async () => {
      try {
        // Check authorization
        const authHeader = req.headers.authorization;
        if (!validateToken(authHeader)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }

        const messages = await getMessages();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(messages));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    })();
    return;
  }

  // Serve static files from public directory
  let filePath = path.join(__dirname, 'public', pathname);

  // If requesting root or directory, serve index.html
  if (pathname === '/') {
    filePath = path.join(__dirname, 'public', 'index.html');
  } else if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveFile(filePath, res);
  } else {
    // 404 - serve index.html for client-side routing
    filePath = path.join(__dirname, 'public', 'index.html');
    serveFile(filePath, res);
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Public files served from: ./public`);
  console.log(`📡 API endpoints available:`);
  console.log(`   - POST /api/auth        (login with admin/password123)`);
  console.log(`   - POST /api/contact     (submit messages)`);
  console.log(`   - GET /api/messages     (view all messages - requires auth)`);
  console.log(`💾 Messages stored in: ./data/messages.json\n`);
});
