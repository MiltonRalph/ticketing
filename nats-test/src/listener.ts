import { connect } from 'nats';
import { TicketCreatedListener } from './events/ticket-created-listener';

(async () => {
  const nc = await connect({ servers: 'localhost:4222' });
  console.log('Listener connected');

  const jsm = await nc.jetstreamManager();
  try {
    await jsm.streams.info('TICKETS');
  } catch {
    await jsm.streams.add({ name: 'TICKETS', subjects: ['ticket.*'] });
  }

  const js = nc.jetstream(); 

  const listener = new TicketCreatedListener(js, jsm);
  await listener.listen();
})();
