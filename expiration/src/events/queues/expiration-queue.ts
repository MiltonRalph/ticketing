import { Queue } from 'bullmq';

interface Payload {
  orderId: string;
}

const connection = {
  host: process.env.REDIS_HOST,
};

export const expirationQueue = new Queue<Payload>('order-expiration', {
  connection,
});