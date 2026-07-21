import {
  Subjects,
  Listener,
  ExpirationCompleteEvent,
  OrderStatus,
} from '@ihetickets/common';
import {
  queueGroupName,
  EXPIRATION_STREAM,
  EXPIRATION_STREAM_SUBJECTS,
} from '../eventUtils';
import { JsMsg } from 'nats';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;
  protected streamName = EXPIRATION_STREAM;
  protected streamSubjects = EXPIRATION_STREAM_SUBJECTS;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: JsMsg) {
    try {
      const order = await Order.findById(data.orderId).populate('ticket');

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === OrderStatus.Complete) {
        return msg.ack();
      }
      
      order.set({
        status: OrderStatus.Cancelled,
      });
      await order.save();
      await new OrderCancelledPublisher(this.client, this.jsm).publish({
        id: order.id,
        version: order.version,
        ticket: {
          id: order.ticket.id,
        },
      });

      msg.ack();
    } catch (err) {
      console.error('Failed to process OrderCancelled event:', err);
      // deliberately don't ack — JetStream will redeliver after ackWait expires
    }
  }
}
