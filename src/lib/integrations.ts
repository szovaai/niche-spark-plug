// Phase 10: external apps are separate products. No fake integrations: status stays
// "not_connected" until a real API and credentials exist.
export type IntegrationStatus = "not_connected" | "awaiting_api" | "connected";
export type Integration = { id: string; name: string; purpose: string; status: IntegrationStatus; needs: string[] };

export const INTEGRATIONS: Integration[] = [
  { id: "clickadmedia", name: "ClickAdMedia", purpose: "Website and funnel page generation", status: "awaiting_api",
    needs: ["API documentation", "API key or OAuth app", "Endpoint to create a site/funnel from a blueprint"] },
  { id: "gitpage", name: "GitPage.site", purpose: "Publishing and hosting", status: "awaiting_api",
    needs: ["API documentation", "Publish/deploy endpoint", "Custom domain support details"] },
  { id: "traffiq", name: "TRAFFIQ AI", purpose: "Marketing automation and organic traffic", status: "awaiting_api",
    needs: ["API documentation", "Campaign creation endpoint", "Reporting endpoint for real traffic numbers"] },
  { id: "xavro", name: "XAVRO CRM", purpose: "Customer and lead management", status: "awaiting_api",
    needs: ["API documentation", "Contact create/update endpoint", "Webhook for new leads/sales"] },
  { id: "payments", name: "Payment provider", purpose: "Subscriptions and product checkout", status: "not_connected",
    needs: ["Your choice of provider (deferred)", "No live payments until approved"] },
];

export const STATUS_LABEL: Record<IntegrationStatus, string> = {
  not_connected: "Not connected", awaiting_api: "Waiting on API access", connected: "Connected",
};
