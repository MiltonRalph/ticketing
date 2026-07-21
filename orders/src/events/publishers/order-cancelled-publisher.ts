import { Publisher, OrderCancelledEvent, Subjects } from "@ihetickets/common";
import { ORDERS_STREAM, ORDERS_STREAM_SUBJECTS } from "../eventUtils";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  protected streamName = ORDERS_STREAM;
  protected streamSubjects = ORDERS_STREAM_SUBJECTS;
}