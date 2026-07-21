import { ExpirationCompleteEvent, OrderStatus } from '@ihetickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { JsMsg, JSONCodec } from 'nats';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Order } from '../../../models/order';

const setup = async () => {
  // create  an instance of the listener
  const listener = new ExpirationCompleteListener(
    natsWrapper.client,
    natsWrapper.jsm,
  );

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'jdjjdj',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  // create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };
  
  // create a fake message object
  // @ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket, order };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, msg, data } = await setup();

  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an orderCancelled event', async () => {
  const { listener, order, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const jc = JSONCodec();

  // @ts-ignore
  const eventData = jc.decode(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );
  // @ts-ignore
  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
