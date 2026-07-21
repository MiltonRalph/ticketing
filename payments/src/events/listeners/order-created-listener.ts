import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@ihetickets/common';
import {
  ORDERS_STREAM,
  ORDERS_STREAM_SUBJECTS,
  queueGroupName,
} from '../eventUtils';
import { JsMsg } from 'nats';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  protected streamName = ORDERS_STREAM;
  protected streamSubjects = ORDERS_STREAM_SUBJECTS;

  async onMessage(data: OrderCreatedEvent['data'], msg: JsMsg) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save();

    msg.ack();
  }
}
