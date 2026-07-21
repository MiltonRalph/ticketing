import { Listener, OrderCreatedEvent, Subjects } from '@ihetickets/common';
import { ORDERS_STREAM, ORDERS_STREAM_SUBJECTS, queueGroupName } from '../eventUtils';
import { JsMsg } from 'nats';
import { expirationQueue } from '../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  protected streamName = ORDERS_STREAM;
  protected streamSubjects = ORDERS_STREAM_SUBJECTS;

  async onMessage(data: OrderCreatedEvent['data'], msg: JsMsg) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many milliseconds to process the job', delay);

    await expirationQueue.add('expire-order', { orderId: data.id }, {delay});

    msg.ack();
  }
}
