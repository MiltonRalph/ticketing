import { Publisher, OrderCreatedEvent, Subjects } from "@ihetickets/common";
import { ORDERS_STREAM, ORDERS_STREAM_SUBJECTS } from "../eventUtils";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  protected streamName = ORDERS_STREAM;
  protected streamSubjects = ORDERS_STREAM_SUBJECTS;
}