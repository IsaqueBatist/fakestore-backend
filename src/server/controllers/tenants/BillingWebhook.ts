import { Request, Response } from "express";
import { getBillingProvider } from "../../shared/services/billing";
import { TenantService } from "../../services/tenants";
import { UnauthorizedError } from "../../errors";

export const billingWebhook = async (req: Request, res: Response) => {
  const provider = getBillingProvider();

  const signature = (req.headers["stripe-signature"] ||
    req.headers["asaas-signature"] ||
    "") as string;

  if (!provider.verifyWebhookSignature(req.body, signature)) {
    throw new UnauthorizedError("errors:invalid_webhook_signature");
  }

  const payload = provider.parseWebhookPayload(req.body);
  await TenantService.handleBillingWebhook(payload);

  return res.status(200).json({ received: true });
};
