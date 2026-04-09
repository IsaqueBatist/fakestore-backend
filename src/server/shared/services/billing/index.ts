import { IBillingProvider } from "./IBillingProvider";
import { StripeProvider } from "./StripeProvider";
import { ConfigurationError } from "../../../errors";

export function getBillingProvider(): IBillingProvider {
  const provider = process.env.BILLING_PROVIDER || "stripe";
  switch (provider) {
    case "stripe":
      return new StripeProvider();
    default:
      throw new ConfigurationError(`Unknown billing provider: ${provider}`);
  }
}

export type {
  IBillingProvider,
  BillingWebhookPayload,
} from "./IBillingProvider";
