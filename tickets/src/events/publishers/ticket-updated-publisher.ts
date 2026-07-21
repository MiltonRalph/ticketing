import { Publisher, Subjects, TicketUpdatedEvent } from '@ihetickets/common';
import { TICKET_STREAM, TICKET_STREAM_SUBJECTS } from '../eventUtils';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  protected streamName = TICKET_STREAM;
  protected streamSubjects = TICKET_STREAM_SUBJECTS;
}
