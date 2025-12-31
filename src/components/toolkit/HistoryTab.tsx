import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HistoryTabProps {
  userId?: string;
}

interface ToolkitSummary {
  id: string;
  title: string;
  niche: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const HistoryTab = ({ userId }: HistoryTabProps) => {
  const navigate = useNavigate();
  const [toolkits, setToolkits] = useState<ToolkitSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToolkits = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("toolkits")
          .select("id, title, niche, status, created_at, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setToolkits(data || []);
      } catch (error) {
        console.error("Error loading toolkits:", error);
        toast.error("Failed to load toolkit history");
      } finally {
        setIsLoading(false);
      }
    };

    loadToolkits();
  }, [userId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this toolkit?")) return;

    try {
      const { error } = await supabase.from("toolkits").delete().eq("id", id);
      if (error) throw error;
      setToolkits((prev) => prev.filter((t) => t.id !== id));
      toast.success("Toolkit deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete toolkit");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Please sign in to view your toolkit history.</p>
      </div>
    );
  }

  if (toolkits.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No toolkits yet. Start creating your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Toolkits</h2>
      
      <div className="grid gap-4">
        {toolkits.map((toolkit) => (
          <Card
            key={toolkit.id}
            className="glass-card hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/toolkit/builder/${toolkit.id}`)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{toolkit.title}</h3>
                <p className="text-sm text-muted-foreground">{toolkit.niche}</p>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(toolkit.updated_at)}</span>
              </div>

              <Badge
                className={cn(
                  toolkit.status === "complete"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {toolkit.status === "complete" ? "Complete" : "Draft"}
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(toolkit.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoryTab;
