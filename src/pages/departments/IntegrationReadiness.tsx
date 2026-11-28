import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { INTEGRATIONS, STATUS_LABEL } from "@/lib/integrations";

export default function IntegrationReadiness() {
  return (
    <DashboardLayout title="Integrations">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Manage</p>
          <h1 className="text-3xl font-bold mt-1">Integrations</h1>
          <p className="text-muted-foreground mt-2">These are separate apps in your ecosystem. Each connects only once a real, secure connection is available — nothing here is simulated.</p>
        </header>
        <div className="space-y-3">
          {INTEGRATIONS.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                <div>
                  <h3 className="font-semibold">{i.name}</h3>
                  <p className="text-sm text-muted-foreground">{i.purpose}</p>
                  <ul className="mt-2 text-xs text-muted-foreground list-disc pl-4">{i.needs.map((n) => <li key={n}>{n}</li>)}</ul>
                </div>
                <Badge variant={i.status === "connected" ? "default" : "outline"} className="shrink-0">{STATUS_LABEL[i.status]}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
