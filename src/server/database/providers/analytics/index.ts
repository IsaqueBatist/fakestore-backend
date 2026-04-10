import * as getOverviewMetrics from "./GetOverviewMetrics";
import * as getFunnelMetrics from "./GetFunnelMetrics";

export const AnalyticsProvider = {
  ...getOverviewMetrics,
  ...getFunnelMetrics,
};
