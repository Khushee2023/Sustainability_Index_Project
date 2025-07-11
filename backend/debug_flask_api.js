const axios = require('axios');

const FLASK_API_URL = 'http://localhost:5000';

async function debugFlaskAPI() {
  try {
    console.log('🔍 Testing Flask API and analyzing response structure...\n');
    
    const testDescription = "LED desk lamp with plastic body";
    
    console.log('📤 Sending request to Flask API:');
    console.log(`URL: ${FLASK_API_URL}/predict`);
    console.log(`Data: ${JSON.stringify({ description: testDescription }, null, 2)}`);
    
    const response = await axios.post(`${FLASK_API_URL}/predict`, {
      description: testDescription
    }, {
      timeout: 10000
    });
    
    console.log('\n📥 Full Response from Flask API:');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    console.log('\n🔍 Analyzing response structure:');
    console.log('Type of response.data:', typeof response.data);
    console.log('Keys in response.data:', Object.keys(response.data));
    
    // Try different possible keys
    const possibleKeys = [
      'sustainability_score',
      'score',
      'prediction',
      'result',
      'sustainability',
      'output'
    ];
    
    console.log('\n🔍 Checking for sustainability score in different keys:');
    for (const key of possibleKeys) {
      if (response.data.hasOwnProperty(key)) {
        console.log(`✅ Found key "${key}":`, response.data[key]);
      } else {
        console.log(`❌ Key "${key}" not found`);
      }
    }
    
    // If it's an array, check the first element
    if (Array.isArray(response.data)) {
      console.log('\n📋 Response is an array:');
      console.log('Length:', response.data.length);
      if (response.data.length > 0) {
        console.log('First element:', response.data[0]);
      }
    }
    
    // Check if the score is nested
    if (typeof response.data === 'object') {
      console.log('\n🔍 Checking nested objects:');
      for (const [key, value] of Object.entries(response.data)) {
        if (typeof value === 'object' && value !== null) {
          console.log(`Nested object "${key}":`, value);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing Flask API:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
  }
}

debugFlaskAPI();