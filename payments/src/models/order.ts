import { OrderStatus } from '@ihetickets/common';
import mongoose from 'mongoose';

// 1. Properties required to create a Order
interface OrderAttrs {
  id: string;
  price: number;
  userId: string;
  status: OrderStatus;
  version: number;
}

// 2. Properties that a Order Document has
interface OrderDoc extends mongoose.Document {
  id: string;
  price: number;
  userId: string;
  status: OrderStatus;
  version: number;
}

// 3. Properties that the overall Order Model has (including our static method)
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

// 4. Create the schema
const orderSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    versionKey: 'version', // renames __v to version,
    optimisticConcurrency: true, // fixes concurrency issues with wrong version comparison
  },
);

// 4. Define the static method (Use standard function syntax to keep 'this' contextual)
orderSchema.statics.build = function (attrs: OrderAttrs) {
  return new Order({
    _id: attrs.id,
    userId: attrs.userId,
    status: attrs.status,
    price: attrs.price,
  });
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
