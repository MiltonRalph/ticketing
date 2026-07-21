export const natsWrapper = {
  // We have to mock both the client and jsm too for jest to reach the stream object
  client: {
    publish: jest.fn().mockResolvedValue({ stream: 'TICKETS', seq: 1 }),
  },
  jsm: {
    streams: {
      info: jest.fn().mockResolvedValue({}), // Pretend the strem already exists
      add: jest.fn().mockResolvedValue({}),
    },
  },
};
