import { Publisher, Subjects, ExpirationCompleteEvent } from "@ihetickets/common";
import { EXPIRATION_STREAM, EXPIRATION_STREAM_SUBJECTS } from "../eventUtils";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  protected streamName = EXPIRATION_STREAM;
  protected streamSubjects = EXPIRATION_STREAM_SUBJECTS;
}