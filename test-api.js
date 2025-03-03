// Simple script to test our API endpoint
const http = require('http');

function testApi() {
  console.log('Testing GET /api/get-leads...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/get-leads',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log(`Received ${parsed.length} leads`);
        if (parsed.length > 0) {
          console.log('Sample lead:', parsed[0]);
        }
        console.log('\nAPI test completed successfully!');
      } catch (error) {
        console.error('Error parsing response:', error);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing API:', error.message);
  });

  req.end();
}

testApi();