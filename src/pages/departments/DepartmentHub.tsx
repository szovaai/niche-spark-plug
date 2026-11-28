import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronRight, Info } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { DEPT_BY_ID } from "@/lib/departments";
import { Button } from "@/components/ui/button";

export default function DepartmentHub({ id, children }: { id: string; children?: React.ReactNode }) {
  const d = DEPT_BY_ID[id];
  const [showAdvanced, setShowAdvanced] = useState(false);
  const entryPaths = new Set(d.entries?.map(e => e.url.split("?")[0]) ?? []);
  const core = d.tools.filter((t) => t.tier !== "advanced" && !entryPaths.has(t.url.split("?")[0]));
  const adv = d.tools.filter((t) => t.tier === "advanced");
  return (
    <DashboardLayout title={d.name}>
      <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-6">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Department</p>
          <h1 className="text-3xl font-bold mt-1">{d.name}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{d.tagline}</p>
        </header>

        {d.entries && (
          <section className="grid md:grid-cols-3 gap-4">
            {d.entries.map((e, i) => (
              <Link key={e.title} to={e.url} className="group">
                <Card className="h-full border-primary/20 hover:border-primary/60 transition-colors">
                  <CardContent className="p-5 space-y-2">
                    <span className="text-xs font-mono text-primary">0{i + 1}</span>
                    <h3 className="font-semibold">{e.title}</h3>
                    <p className="text-sm text-muted-foreground">{e.blurb}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">Start <ArrowRight className="h-4 w-4" /></span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
        )}

        {children}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tools in this department</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {core.map((t) => <ToolCard key={t.url} {...t} />)}
          </div>
          {adv.length > 0 && (
            <>
              <Button variant="ghost" onClick={() => setShowAdvanced((v) => !v)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />} Advanced tools ({adv.length})
              </Button>
              {showAdvanced && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{adv.map((t) => <ToolCard key={t.url} {...t} />)}</div>}
            </>
          )}
        </section>

        {d.note && (
          <p className="flex gap-2 text-xs text-muted-foreground border border-border/50 rounded-lg p-3"><Info className="h-4 w-4 shrink-0" />{d.note}</p>
        )}
      </div>
    </DashboardLayout>
  );
}

function ToolCard({ title, url, blurb }: { title: string; url: string; blurb: string }) {
  return (
    <Link to={url}>
      <Card className="h-full hover:bg-muted/30 transition-colors">
        <CardContent className="p-4">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{blurb}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
