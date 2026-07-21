import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from '@ihetickets/common';
import {
  ORDERS_STREAM,
  ORDERS_STREAM_SUBJECTS,
  queueGroupName,
} from '../eventUtils';
import { JsMsg } from 'nats';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  protected streamName = ORDERS_STREAM;
  protected streamSubjects = ORDERS_STREAM_SUBJECTS;

  async onMessage(data: OrderCancelledEvent['data'], msg: JsMsg) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
