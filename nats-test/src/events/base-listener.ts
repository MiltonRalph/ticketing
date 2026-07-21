import {
  JetStreamClient,
  JetStreamManager,
  JsMsg,
  AckPolicy,
  DeliverPolicy,
  JSONCodec,
} from 'nats';

// Here, T is a generic placeholder — a type that isn't fixed yet, and gets filled in by whoever extends the class. The constraint T extends { subject: string; data: any } just says: "whatever T ends up being, it must at least have a subject and a data property"
export abstract class Listener<T extends { subject: string; data: any }> {
  abstract subject: T['subject'];
  abstract queueGroupName: string; // doubles as the durable consumer name
  abstract onMessage(data: T['data'], msg: JsMsg): void;
  protected abstract streamName: string;

  protected ackWait = 30 * 1000; // ms
  private client: JetStreamClient;
  private jsm: JetStreamManager;
  private jc = JSONCodec();

  constructor(
    client: JetStreamClient,
    jsm: JetStreamManager,
  ) {
    this.client = client;
    this.jsm = jsm;
  }

  async listen() {
    // Ensure durable pull consumer exists, scoped to this subject
    try {
      await this.jsm.consumers.info(this.streamName, this.queueGroupName);
      console.log(`Consumer "${this.queueGroupName}" already exists`);
    } catch {
      await this.jsm.consumers.add(this.streamName, {
        durable_name: this.queueGroupName,
        ack_policy: AckPolicy.Explicit,
        ack_wait: this.ackWait * 1_000_000, // ms -> ns
        deliver_policy: DeliverPolicy.All,
        max_ack_pending: 20,
        filter_subject: this.subject,
      });
      console.log(`Consumer "${this.queueGroupName}" created`);
    }

    const consumer = await this.client.consumers.get(
      this.streamName,
      this.queueGroupName,
    );
    const messages = await consumer.consume();

    for await (const msg of messages) {
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    }
  }

  parseMessage(msg: JsMsg) {
    return this.jc.decode(msg.data);
  }
}
