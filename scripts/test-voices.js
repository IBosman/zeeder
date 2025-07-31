// Simple test script to verify the voices API is working

async function testVoicesAPI() {
  try {
    // Test GET /api/admin/voices
    console.log('Testing GET /api/admin/voices...');
    const listResponse = await fetch('http://localhost:3000/api/admin/voices', {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!listResponse.ok) {
      throw new Error(`Failed to fetch voices: ${listResponse.status} ${listResponse.statusText}`);
    }
    
    const voices = await listResponse.json();
    console.log('Successfully fetched voices:', voices);
    
    if (voices.data && voices.data.length > 0) {
      const firstVoice = voices.data[0];
      
      // Test GET /api/admin/voices/:voiceId
      console.log(`\nTesting GET /api/admin/voices/${firstVoice.voiceId}...`);
      const getResponse = await fetch(`http://localhost:3000/api/admin/voices/${firstVoice.voiceId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!getResponse.ok) {
        throw new Error(`Failed to fetch voice: ${getResponse.status} ${getResponse.statusText}`);
      }
      
      const voice = await getResponse.json();
      console.log('Successfully fetched voice:', voice);
    }
    
    console.log('\nAll tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testVoicesAPI();
