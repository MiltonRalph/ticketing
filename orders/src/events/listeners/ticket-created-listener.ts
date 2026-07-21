import { Subjects, Listener, TicketCreatedEvent } from '@ihetickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName, TICKET_STREAM, TICKET_STREAM_SUBJECTS } from '../eventUtils';
import { JsMsg } from 'nats';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;
  protected streamName = TICKET_STREAM;
  protected streamSubjects = TICKET_STREAM_SUBJECTS;

  async onMessage(data: TicketCreatedEvent['data'], msg: JsMsg) {
    const { id, title, price } = data;

    try {
      const ticket = Ticket.build({ id, title, price });
      await ticket.save();

      msg.ack();
    } catch (err) {
      console.error('Failed to process TicketCreated event:', err);
      // deliberately don't ack — JetStream will redeliver after ackWait expires
    }
  }
}
