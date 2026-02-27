import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const mongoUri = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('URI (first 50 chars):', mongoUri?.substring(0, 50), '...');

if (!mongoUri) {
  console.error('❌ MONGODB_URI not set');
  process.exit(1);
}

const client = new MongoClient(mongoUri);

try {
  console.log('1️⃣  Connecting...');
  await client.connect();
  console.log('✅ Connected!');
  
  console.log('\n2️⃣  Testing database access...');
  const db = client.db('portfolio');
  const collection = db.collection('messages');
  
  console.log('✅ Database access successful');
  
  console.log('\n3️⃣  Creating index...');
  await collection.createIndex({ timestamp: -1 });
  console.log('✅ Index created');
  
  console.log('\n4️⃣  Inserting test message...');
  const result = await collection.insertOne({
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message from MongoDB!',
    timestamp: new Date()
  });
  console.log('✅ Message inserted! ID:', result.insertedId);
  
  console.log('\n5️⃣  Reading all messages...');
  const messages = await collection.find({}).toArray();
  console.log(`✅ Found ${messages.length} messages`);
  messages.forEach((msg, i) => {
    console.log(`  ${i + 1}. ${msg.name} (${msg.email}): "${msg.message}"`);
  });
  
  console.log('\n✨ All tests passed!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  await client.close();
  console.log('\n🔌 Connection closed');
}
