import mongoose from 'mongoose';
import { Order } from './order';
import { OrderStatus } from '@ihetickets/common';

// 1. Properties required to create a Ticket
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

// 2. Properties that a Ticket Document has
export interface TicketDoc extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

// 3. Properties that the overall Ticket Model has (including our static method)
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

// 4. Create the schema
const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    versionKey: 'version',
  },
);

// 4. Define the static method (Use standard function syntax to keep 'this' contextual)
ticketSchema.statics.build = function (attrs: TicketAttrs) {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};
ticketSchema.methods.isReserved = async function () {
  // this === the ticket document that we just called 'isReserved' on
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPaymwent,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

// 5. Pass BOTH TicketDoc and TicketModel into the generic fields
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

/*
TicketAttrs: The properties required to make a ticket (e.g., input data from Postman).
TicketDoc: The properties a user has after being made (includes Mongoose properties like _id and internal methods).
UserStatics: The list of custom tools attached directly to the global Ticket model.
Ticket.build(): The actual tool that safely bridges TicketAttrs into a fully typed TicketDoc
*/
export { Ticket };
