// Test basic HTTP connectivity to Supabase
console.log('Testing connectivity to Supabase...')

try {
  const response = await fetch('https://ijhdehnpbmfbitnphqii.supabase.co/rest/v1/messages?select=*', {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaGRlaG5wYm1mYml0bnBocWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNTM0MDksImV4cCI6MjA4NzcyOTQwOX0._trEluvh9sMzpYOXwfIxDv1koaXbyVVDOzIkHRa7CZ8',
      'Content-Type': 'application/json',
    }
  })
  
  console.log('Status:', response.status)
  const data = await response.json()
  console.log('Response:', JSON.stringify(data, null, 2))
} catch (err) {
  console.error('Error:', err.message)
}
