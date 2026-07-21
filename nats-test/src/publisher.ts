import { connect } from 'nats';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

(async () => {
  const nc = await connect({ servers: 'localhost:4222' });
  console.log('Publisher connected to NATS');

  const jsm = await nc.jetstreamManager();
  const js = nc.jetstream();

  const publisher = new TicketCreatedPublisher(js, jsm);

  await publisher.publish({
    id: '123',
    title: 'concert',
    price: 20,
    userId: 'dhsh363h',
  });

  // Drain waits until every message has been sent
  // before closing the connection.
  await nc.drain();
})();
