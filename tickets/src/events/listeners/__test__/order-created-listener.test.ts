import { OrderCreatedEvent, OrderStatus } from '@ihetickets/common';
import { Ticket } from '../../../models/tickets';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import mongoose from 'mongoose';
import { JsMsg, JSONCodec } from 'nats';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(
    natsWrapper.client,
    natsWrapper.jsm,
  );

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'asdf',
  });
  await ticket.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'dnndndn',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('sets the userId of the ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const jc = JSONCodec();

  // @ts-ignore
  const eventData = jc.decode(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );

  //@ts-ignore
  expect(data.id).toEqual(eventData.orderId);
  // @ts-ignore
  expect(ticket.version + 1).toEqual(eventData.version);
});
