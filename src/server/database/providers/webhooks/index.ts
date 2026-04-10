import * as getEvents from "./GetEvents";
import * as getEventById from "./GetEventById";

export const WebhookEventProvider = {
  ...getEvents,
  ...getEventById,
};
