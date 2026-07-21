import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created.listener';

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
  if (!process.env.NATS_URI) {
    throw new Error('NATS_URI must be defined');
  }
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  // No try/catch here — if any of this fails, let it throw.
  // The unhandled rejection below will crash the process,
  // and Kubernetes will restart the pod per its restart policy.
  await connectWithRetry(process.env.MONGO_URI);

  await natsWrapper.connect(process.env.NATS_URI);
  console.log('Connected to NATS');

  // Intentionally not awaited — listen() runs an infinite loop processing messages
  // in the background; awaiting it here would block the rest of startup forever.
  new TicketCreatedListener(natsWrapper.client, natsWrapper.jsm).listen();
  new TicketUpdatedListener(natsWrapper.client, natsWrapper.jsm).listen();
  new ExpirationCompleteListener(natsWrapper.client, natsWrapper.jsm).listen();
  new PaymentCreatedListener(natsWrapper.client, natsWrapper.jsm).listen();

  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};

start().catch((err) => {
  console.error('Failed to start service:', err);
  process.exit(1);
});
