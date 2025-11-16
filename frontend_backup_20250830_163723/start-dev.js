// Simple script to start Vite dev server with better error handling
const { createServer } = require('vite');

async function startDevServer() {
  try {
    console.log('Starting Vite dev server...');
    const server = await createServer({
      // Any valid Vite config options here
      server: {
        port: 3001,
        host: true,
        open: true
      }
    });
    
    await server.listen();
    
    server.printUrls();
    console.log('Vite dev server started successfully!');
  } catch (error) {
    console.error('Failed to start Vite dev server:');
    console.error(error);
    process.exit(1);
  }
}

startDevServer();
