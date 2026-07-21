import { Worker } from 'bullmq';
import { ExpirationCompletePublisher } from '../publishers/expiration-complete-publisher';
import { natsWrapper } from '../../nats-wrapper';

const connection = {
  host: process.env.REDIS_HOST,
};

export const expirationWorker = new Worker(
  'order-expiration',
  async (job) => {
    console.log('Processing job with id', job.data.orderId);

    new ExpirationCompletePublisher(
      natsWrapper.client,
      natsWrapper.jsm,
    ).publish({
      orderId: job.data.orderId,
    });
  },
  { connection },
);
