import { Publisher, Subjects, TicketCreatedEvent } from '@ihetickets/common';
import { TICKET_STREAM, TICKET_STREAM_SUBJECTS } from '../eventUtils';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  protected streamName = TICKET_STREAM;
  protected streamSubjects = TICKET_STREAM_SUBJECTS;
}
