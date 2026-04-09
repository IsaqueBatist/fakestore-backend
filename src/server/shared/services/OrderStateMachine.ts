import { EOrderStatus } from "../../database/models/OrderStatus";
import { ConflictError } from "../../errors";

const VALID_TRANSITIONS: Record<EOrderStatus, EOrderStatus[]> = {
  [EOrderStatus.PENDING]: [EOrderStatus.AWAITING_PAYMENT, EOrderStatus.CANCELLED],
  [EOrderStatus.AWAITING_PAYMENT]: [EOrderStatus.PAID, EOrderStatus.CANCELLED],
  [EOrderStatus.PAID]: [EOrderStatus.SHIPPED],
  [EOrderStatus.SHIPPED]: [EOrderStatus.DELIVERED],
  [EOrderStatus.DELIVERED]: [],
  [EOrderStatus.CANCELLED]: [],
};

const TRANSITION_WEBHOOKS: Partial<Record<EOrderStatus, string>> = {
  [EOrderStatus.AWAITING_PAYMENT]: "order.awaiting_payment",
  [EOrderStatus.PAID]: "order.paid",
  [EOrderStatus.SHIPPED]: "order.shipped",
  [EOrderStatus.DELIVERED]: "order.delivered",
  [EOrderStatus.CANCELLED]: "order.cancelled",
};

export const validateTransition = (current: EOrderStatus, target: EOrderStatus): void => {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed || !allowed.includes(target)) {
    throw new ConflictError("errors:invalid_order_status", {
      current,
      target,
    });
  }
};

export const getWebhookEvent = (target: EOrderStatus): string | null => {
  return TRANSITION_WEBHOOKS[target] ?? null;
};

export const isTerminalStatus = (status: EOrderStatus): boolean => {
  return VALID_TRANSITIONS[status]?.length === 0;
};
