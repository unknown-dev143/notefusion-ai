// Simple script to test if Vite is working
import { createServer } from 'vite';

async function testVite() {
  try {
    console.log('Starting Vite server...');
    const server = await createServer({
      // Any valid Vite config options here
      root: '.',
      server: {
        port: 3001,
        open: true
      }
    });
    
    await server.listen();
    
    server.printUrls();
    console.log('Vite server started successfully!');
    
    // Keep the process running
    await new Promise(() => {});
    
  } catch (error) {
    console.error('Failed to start Vite server:');
    console.error(error);
    process.exit(1);
  }
}

testVite();
