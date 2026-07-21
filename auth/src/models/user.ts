import mongoose from 'mongoose';
import { Password } from '../utils/password';

// 1. Properties required to create a User
interface UserAttrs {
  email: string;
  password: string;
}

// 2. Properties that a User Document has
interface UserDoc extends mongoose.Document {
  id: string;
  email: string;
  password: string;
}

// 3. Properties that the overall User Model has (including our static method)
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// 4. Create the schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
});

// 5. Define the static method (Use standard function syntax to keep 'this' contextual)
userSchema.statics.build = function (attrs: UserAttrs) {
  return new User(attrs);
};

// 6. Pass BOTH UserDoc and UserModel into the generic fields
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

/*
UserAttrs: The properties required to make a user (e.g., input data from Postman).
UserDoc: The properties a user has after being made (includes Mongoose properties like _id and internal methods).
UserStatics: The list of custom tools attached directly to the global User model.
User.build(): The actual tool that safely bridges UserAttrs into a fully typed UserDoc
*/
export { User };
