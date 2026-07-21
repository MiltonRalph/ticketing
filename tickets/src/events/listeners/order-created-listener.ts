import { Listener, OrderCreatedEvent, Subjects } from '@ihetickets/common';
import { queueGroupName, ORDERS_STREAM, ORDERS_STREAM_SUBJECTS } from '../eventUtils';
import { JsMsg } from 'nats';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  protected streamName = ORDERS_STREAM;
  queueGroupName = queueGroupName;
  protected streamSubjects = ORDERS_STREAM_SUBJECTS;

  async onMessage(data: OrderCreatedEvent['data'], msg: JsMsg) {
    // Find the ticket the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting its orderId property
    ticket.set({ orderId: data.id });

    // Save the ticket
    await ticket.save();
    await new TicketUpdatedPublisher(this.client, this.jsm).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      ...(ticket.orderId && { orderId: ticket.orderId }),
    });

    // Ack the message
    msg.ack();
  }
}
