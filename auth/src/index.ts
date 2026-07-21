import mongoose from 'mongoose';
import { app } from './app';

const connectWithRetry = async (
  uri: string,
  retries = 5,
  delayMs = 3000,
): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed`);
      if (attempt === retries) {
        throw err; // out of retries — let it propagate and crash the process
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
};

const start = async () => {
  console.log('Starting up...');
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  await connectWithRetry(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};

// Catch any unhandled rejection at the root to ensure the process exits cleanly
start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1); // Forces the container/process to close
});
