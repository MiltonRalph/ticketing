import { Subjects, Listener, TicketUpdatedEvent } from '@ihetickets/common';
import { Ticket } from '../../models/ticket';
import {
  queueGroupName,
  TICKET_STREAM,
  TICKET_STREAM_SUBJECTS,
} from '../eventUtils';
import { JsMsg } from 'nats';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;
  protected streamName = TICKET_STREAM;
  protected streamSubjects = TICKET_STREAM_SUBJECTS;

  async onMessage(data: TicketUpdatedEvent['data'], msg: JsMsg) {
    const existing = await Ticket.findById(data.id);
    console.log(
      'Local ticket state:',
      existing ? { version: existing.version } : 'DOES NOT EXIST',
    );
    console.log('Incoming event version:', data.version);
    try {
      const ticket = await Ticket.findOne({
        _id: data.id,
        version: data.version - 1, // previous version
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      const { title, price } = data;
      ticket.set({ title, price, version: data.version });
      await ticket.save();

      msg.ack();
    } catch (err) {
      console.error('Failed to process TicketUpdated event:', err);
      // deliberately don't ack — JetStream will redeliver after ackWait expires
    }
  }
}
