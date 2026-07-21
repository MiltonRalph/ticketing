import { JetStreamClient, JetStreamManager, JSONCodec } from 'nats';

export abstract class Publisher<T extends { subject: string; data: any }> {
  abstract subject: T['subject'];
  protected abstract streamName: string;
  protected abstract streamSubjects: string[];

  private jc = JSONCodec();

  constructor(private client: JetStreamClient, private jsm: JetStreamManager) {}

  private async ensureStreamExists() {
    try {
      await this.jsm.streams.info(this.streamName);
    } catch {
      await this.jsm.streams.add({
        name: this.streamName,
        subjects: this.streamSubjects,
      });
      console.log(`Stream "${this.streamName}" created`);
    }
  }

  async publish(data: T['data']): Promise<void> {
    await this.ensureStreamExists();

    const ack = await this.client.publish(this.subject, this.jc.encode(data));
    console.log(`Published to "${this.subject}" — stream: ${ack.stream}, seq: ${ack.seq}`);
  }
}