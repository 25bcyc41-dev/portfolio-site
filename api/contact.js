import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not set');
}

let cachedClient = null;
let cachedDb = null;

// Reuse MongoDB connection across requests (important for serverless)
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

// Get all messages from MongoDB
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

// Save message to MongoDB
async function saveMessage(name, email, message) {
  try {
    console.log('Attempting to insert message...');
    
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

// API handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { name, email, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const saved = await saveMessage(name, email, message);
      return res.status(200).json({
        success: true,
        message: 'Message saved successfully ✅',
        data: saved
      });
    } catch (error) {
      console.error('Handler error:', error);
      return res.status(500).json({ 
        error: error.message || 'Failed to save message',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const messages = await getMessages();
      return res.status(200).json(messages);
    } catch (error) {
      console.error('Handler error:', error);
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
