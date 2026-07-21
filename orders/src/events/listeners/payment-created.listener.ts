import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from '@ihetickets/common';
import { Order } from '../../models/order';
import {
  queueGroupName,
  PAYMENT_STREAM,
  PAYMENT_STREAM_SUBJECTS,
} from '../eventUtils';
import { JsMsg } from 'nats';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;
  protected streamName = PAYMENT_STREAM;
  protected streamSubjects = PAYMENT_STREAM_SUBJECTS;

  async onMessage(data: PaymentCreatedEvent['data'], msg: JsMsg) {
    try {
      const order = await Order.findById(data.orderId);

      if (!order) {
        throw new Error('Order not found');
      }

      order.set({
        status: OrderStatus.Complete,
      });
      order.save();

      msg.ack();
    } catch (err) {
      console.error('Failed to process OrderCreated event:', err);
      // deliberately don't ack — JetStream will redeliver after ackWait expires
    }
  }
}
