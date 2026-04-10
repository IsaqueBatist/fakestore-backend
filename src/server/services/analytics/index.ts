import * as getOverview from "./GetOverview";
import * as getFunnel from "./GetFunnel";

export const AnalyticsService = {
  ...getOverview,
  ...getFunnel,
};
