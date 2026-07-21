import mongoose from 'mongoose';

// 1. Properties required to create a Ticket
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// 2. Properties that a Ticket Document has
interface TicketDoc extends mongoose.Document {
  id: string;
  title: string;
  price: number;
  userId: string;
  orderId?: string;
  version: number;
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
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
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
ticketSchema.statics.build = function (attrs: TicketAttrs) {
  return new Ticket(attrs);
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
