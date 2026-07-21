import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';
import './events/workers/expiration-worker';

const start = async () => {
  if (!process.env.NATS_URI) {
    throw new Error('NATS_URI must be defined');
  }

  await natsWrapper.connect(process.env.NATS_URI);
  console.log('Connected to NATS');

  new OrderCreatedListener(natsWrapper.client, natsWrapper.jsm).listen();
};

start().catch((err) => {
  console.error('Failed to start service:', err);
  process.exit(1);
});
