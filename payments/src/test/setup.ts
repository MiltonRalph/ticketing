import dotenv from 'dotenv'

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, './config.env') });

import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

let mongo: MongoMemoryServer;

declare global {
  var fabricateCookie: (id?: string) => string[];
}

jest.mock('../nats-wrapper');
process.env.STRIPE_KEY;

beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
}, 20000);

beforeEach(async () => {
  jest.clearAllMocks();
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) {
    await mongo.stop();
  }
});

global.fabricateCookie = (id?: string) => {
  // Build a JWT payload. {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object. {jwt: MY_JWT}
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string, that's the cookie with the encoded data
  return [`session=${base64}`];
};
