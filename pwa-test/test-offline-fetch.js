// Test offline functionality
async function testOffline() {
  try {
    console.log('Starting offline test...');
    
    // First, ensure the file is cached
    console.log('Caching test file...');
    await caches.open('pwa-test-cache-v1')
      .then(cache => cache.add('test-offline.txt'));
    
    // Test online fetch first
    console.log('Testing online fetch...');
    const onlineResponse = await fetch('test-offline.txt');
    if (onlineResponse.ok) {
      const text = await onlineResponse.text();
      console.log('✅ Online fetch successful:', text.trim());
      
      // Simulate offline mode
      console.log('Simulating offline mode...');
      Object.defineProperty(navigator, 'onLine', {
        get: function() { return false; },
        configurable: true
      });
      
      // Test offline fetch
      try {
        const offlineResponse = await fetch('test-offline.txt');
        if (offlineResponse) {
          const offlineText = await offlineResponse.text();
          console.log('✅ Offline fetch successful:', offlineText.trim());
          return true;
        }
      } catch (error) {
        console.error('❌ Offline fetch failed:', error);
        return false;
      } finally {
        // Restore online status
        Object.defineProperty(navigator, 'onLine', {
          get: function() { return true; },
          configurable: true
        });
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
  return false;
}

// Run the test
testOffline().then(success => {
  console.log(success ? '✅ Offline test passed!' : '❌ Offline test failed!');
});
