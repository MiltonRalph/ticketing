import { PaymentCreatedEvent, Publisher, Subjects } from '@ihetickets/common';
import { PAYMENT_STREAM, PAYMENT_STREAM_SUBJECTS } from '../eventUtils';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  protected streamName = PAYMENT_STREAM;
  protected streamSubjects = PAYMENT_STREAM_SUBJECTS;
}
