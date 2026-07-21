import { OrderCancelledEvent, OrderStatus } from '@ihetickets/common';
import { Ticket } from '../../../models/tickets';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { JsMsg, JSONCodec } from 'nats';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(
    natsWrapper.client,
    natsWrapper.jsm,
  );

  // Create and save a ticket
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 30,
    userId: 'asdf',
  });
  ticket.set({ orderId });
  await ticket.save();

  // Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('updates the ticket, publishes an event, and acks the message', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
