import mongoose from 'mongoose';
import { OrderStatus } from '@ihetickets/common';
import { TicketDoc } from './ticket';

// 1. Properties required to create a Order
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  ticket: TicketDoc;
  expiresAt: Date;
}

// 2. Properties that a Order Document has
interface OrderDoc extends mongoose.Document {
  id: string;
  userId: string;
  status: OrderStatus;
  ticket: TicketDoc;
  expiresAt: Date;
  version: number;
}

// 3. Properties that the overall Order Model has (including our static method)
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

// 4. Create the schema
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
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
    optimisticConcurrency: true,
  },
);

// 4. Define the static method (Use standard function syntax to keep 'this' contextual)
orderSchema.statics.build = function (attrs: OrderAttrs) {
  return new Order(attrs);
};

// 5. Pass BOTH OrderDoc and OrderModel into the generic fields
const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

/*
OrderAttrs: The properties required to make a Order (e.g., input data from Postman).
OrderDoc: The properties a user has after being made (includes Mongoose properties like _id and internal methods).
UserStatics: The list of custom tools attached directly to the global Order model.
Order.build(): The actual tool that safely bridges OrderAttrs into a fully typed OrderDoc
*/
export { Order };
