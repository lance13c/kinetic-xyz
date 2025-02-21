import { startServer } from './server';

// Only start the server if this file is executed directly
if (require.main === module) {
  startServer();
}
