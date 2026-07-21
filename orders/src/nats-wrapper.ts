import {
  connect,
  NatsConnection,
  JetStreamClient,
  JetStreamManager,
  ConnectionOptions,
} from 'nats';

class NatsWrapper {
  private _connection?: NatsConnection;
  private _client?: JetStreamClient;
  private _jsm?: JetStreamManager;

  get connection() {
    if (!this._connection) {
      throw new Error('Cannot access NATS connection before connecting');
    }
    return this._connection;
  }

  get client() {
    if (!this._client) {
      throw new Error('Cannot access JetStream client before connecting');
    }
    return this._client;
  }

  get jsm() {
    if (!this._jsm) {
      throw new Error('Cannot access JetStream manager before connecting');
    }
    return this._jsm;
  }

  async connect(servers: string) {
    const options: ConnectionOptions = {
      servers,
      reconnect: true, // enabled by default, but explicit is better than implicit
      maxReconnectAttempts: 30, // finite — but generous (roughly ~10 min at 2s intervals)
      reconnectTimeWait: 2000, // wait 2s between attempts
      reconnectDelayHandler: () => 2000, // keeps a flat 2s backoff; swap for exponential if you prefer
      waitOnFirstConnect: true, // if the FIRST connect attempt fails (e.g. NATS pod not ready yet),
      // keep retrying instead of throwing immediately — this alone
      // solves a lot of the startup-race issues we hit earlier with Mongo
    };

    this._connection = await connect(options);
    console.log('Connected to NATS');

    this._jsm = await this._connection.jetstreamManager();
    this._client = this._connection.jetstream();

    // Background listener — gives explicit visibility into connection health events
    this.monitorStatus();

    // If the connection is EVER fully closed (not just disconnected — closed means
    // NATS gave up or was told to stop), this is your last line of defense.
    this._connection.closed().then((err) => {
      if (err) {
        console.error(
          `NATS connection permanently closed due to error: ${err.message}`,
        );
      } else {
        console.log('NATS connection permanently closed');
      }

      // With maxReconnectAttempts: -1, this should only fire on unrecoverable
      // conditions (e.g. auth failure, explicit close). Crash loudly so
      // Kubernetes restarts the pod rather than limping along with a dead client.
      process.exit(1);
    });
  }

  private async monitorStatus() {
    if (!this._connection) return;

    // status() is an async iterator that yields every connection lifecycle event —
    // this is your explicit network-health visibility, distinct from just
    // succeed/fail on individual requests.
    for await (const status of this._connection.status()) {
      switch (status.type) {
        case 'disconnect':
          console.warn(`NATS disconnected: ${JSON.stringify(status.data)}`);
          break;
        case 'reconnecting':
          console.warn('NATS attempting to reconnect...');
          break;
        case 'reconnect':
          console.log(`NATS reconnected: ${JSON.stringify(status.data)}`);
          break;
        case 'error':
          console.error(
            `NATS connection error: ${JSON.stringify(status.data)}`,
          );
          break;
        case 'ldm':
          console.warn(
            'NATS server signaled lame duck mode — a reconnect will be needed soon',
          );
          break;
        case 'update':
          console.log(
            `NATS cluster topology updated: ${JSON.stringify(status.data)}`,
          );
          break;
        default:
          console.log(`NATS status event: ${status.type}`);
      }
    }
  }
}

export const natsWrapper = new NatsWrapper();
