import { Listener } from './base-listener';
import { JsMsg } from 'nats';
import { Subjects } from './subjects';
import { TicketCreatedEvent } from './ticket-created-interface';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // readonly is an attribute in typescript that let it know that the value cannot change thereby removing the error that occurs with typescript thinking that we might want to change the value in some part of our code and therby flags it as a concern
  readonly subject = Subjects.TicketCreated;
  queueGroupName = 'ticket-service';
  protected streamName = 'TICKETS';

  // TicketCreatedEvent['data'] gives you the type of the data property on TicketCreatedEvent
  onMessage(data: TicketCreatedEvent['data'], msg: JsMsg) {
    console.log('Event data!', data);
    // pretend to save to DB here
    msg.ack();
  }
}
