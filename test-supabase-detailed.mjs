import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test 1: Check if table exists
console.log('\n1️⃣  Testing table read...')
try {
  const { data, error, status } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .limit(1)

  if (error) {
    console.error('❌ Error:', error.message, error.code)
  } else {
    console.log('✅ Table exists! Current rows:', data?.length || 0)
  }
} catch (err) {
  console.error('❌ Exception:', err.message)
}

// Test 2: Try inserting a message
console.log('\n2️⃣  Testing message insert...')
try {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message',
        timestamp: new Date().toISOString()
      }
    ])
    .select()

  if (error) {
    console.error('❌ Insert error:', error.message, error.code)
  } else {
    console.log('✅ Message inserted!', data)
  }
} catch (err) {
  console.error('❌ Exception:', err.message)
}

// Test 3: Read all messages
console.log('\n3️⃣  Reading all messages...')
try {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('timestamp', { ascending: false })

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Messages:', data?.length || 0)
    data?.forEach((msg, i) => {
      console.log(`  ${i + 1}. ${msg.name} (${msg.email}): "${msg.message}"`)
    })
  }
} catch (err) {
  console.error('❌ Exception:', err.message)
}

console.log('\n✨ Tests complete!')
