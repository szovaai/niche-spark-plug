import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, Tag, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Version {
  id: string;
  version_number: number;
  label: string | null;
  step_data: any;
  created_at: string;
}

interface VersionHistoryProps {
  projectId: string;
  userId: string;
  currentData: any;
  onRestore: (stepData: any) => void;
}

export default function VersionHistory({ projectId, userId, currentData, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded && projectId) fetchVersions();
  }, [expanded, projectId]);

  const fetchVersions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_versions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error && data) setVersions(data as Version[]);
    setLoading(false);
  };

  const saveSnapshot = async (label?: string) => {
    const nextVersion = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) + 1 : 1;
    const { error } = await supabase.from("project_versions").insert({
      project_id: projectId,
      user_id: userId,
      version_number: nextVersion,
      step_data: currentData,
      label: label || null,
    } as any);
    if (error) {
      toast.error("Failed to save snapshot");
      return;
    }
    toast.success(`Version ${nextVersion} saved!`);
    fetchVersions();
  };

  const restore = (version: Version) => {
    onRestore(version.step_data);
    toast.success(`Restored to version ${version.version_number}`);
  };

  if (!expanded) {
    return (
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setExpanded(true)}>
        <History className="w-3.5 h-3.5" />
        Version History ({versions.length || "…"})
      </Button>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">Version History</h4>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="default" size="sm" className="h-7 text-xs gap-1" onClick={() => saveSnapshot()}>
              Save Snapshot
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setExpanded(false)}>
              Close
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : versions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No saved versions yet. Click "Save Snapshot" to create one.</p>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-1.5">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">v{v.version_number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {v.label ? (
                        <Badge variant="secondary" className="text-[10px] gap-0.5">
                          <Tag className="w-2.5 h-2.5" /> {v.label}
                        </Badge>
                      ) : (
                        <span className="text-xs font-medium">Version {v.version_number}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => restore(v)}
                  >
                    <RotateCcw className="w-3 h-3" /> Restore
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
