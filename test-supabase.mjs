import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key exists:', !!supabaseAnonKey)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection
try {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .limit(1)

  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Connection successful!')
    console.log('Data:', data)
  }
} catch (err) {
  console.error('❌ Connection failed:', err.message)
}
