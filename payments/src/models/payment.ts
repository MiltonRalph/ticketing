import mongoose from 'mongoose';

// 1. Properties required to create a Payment
interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

// 2. Properties that a Payment Document has
interface PaymentDoc extends mongoose.Document {
  id: string,
  orderId: string;
  stripeId: string;
}

// 3. Properties that the overall Payment Model has (including our static method)
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

// 4. Create the schema
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
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
  },
);

// 4. Define the static method (Use standard function syntax to keep 'this' contextual)
paymentSchema.statics.build = function (attrs: PaymentAttrs) {
  return new Payment(attrs);
};

// 5. Pass BOTH PaymentDoc and PaymentModel into the generic fields
const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

/*
PaymentAttrs: The properties required to make a Payment (e.g., input data from Postman).
PaymentDoc: The properties a user has after being made (includes Mongoose properties like _id and internal methods).
UserStatics: The list of custom tools attached directly to the global Payment model.
Payment.build(): The actual tool that safely bridges PaymentAttrs into a fully typed PaymentDoc
*/
export { Payment };
