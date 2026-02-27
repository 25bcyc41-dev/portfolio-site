import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get all messages from Supabase
async function getMessages() {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    return [];
  }
}

// Save message to Supabase
async function saveMessage(name, email, message) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          timestamp: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) throw error;
    
    const newMessage = data[0];
    console.log(`[Saved] Message #${newMessage.id} persisted to Supabase`);
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
      return res.status(500).json({ error: error.message || 'Failed to save message' });
    }
  }

  if (req.method === 'GET') {
    try {
      const messages = await getMessages();
      return res.status(200).json(messages);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
