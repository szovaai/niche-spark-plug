import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, CheckCircle2, Package } from "lucide-react";

export interface DownloadItem {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DownloadItem[];
  onConfirm: (selectedIds: string[]) => Promise<void>;
  title?: string;
}

export default function DownloadChecklistModal({ open, onOpenChange, items, onConfirm, title = "Download Bundle" }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(items.filter(i => i.enabled).map(i => i.id)));
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [done, setDone] = useState(false);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    setDownloading(true);
    setProgress(0);
    setDone(false);

    // Simulate progress updates — the actual bundler fires progress callbacks
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 400);

    try {
      await onConfirm(Array.from(selected));
      clearInterval(interval);
      setProgress(100);
      setProgressLabel("Complete!");
      setDone(true);
      setTimeout(() => {
        onOpenChange(false);
        setDownloading(false);
        setDone(false);
        setProgress(0);
      }, 1500);
    } catch {
      clearInterval(interval);
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={downloading ? undefined : onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {!downloading ? (
          <>
            <p className="text-sm text-muted-foreground">Select which assets to include in your download:</p>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {items.map(item => (
                <label key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 cursor-pointer transition-colors">
                  <Checkbox
                    checked={selected.has(item.id)}
                    onCheckedChange={() => toggle(item.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleConfirm} disabled={selected.size === 0} className="gap-2">
                <Download className="w-4 h-4" />
                Download {selected.size} {selected.size === 1 ? "item" : "items"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-center">
              {done ? (
                <CheckCircle2 className="w-12 h-12 text-green-500 animate-in zoom-in" />
              ) : (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              )}
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-center text-muted-foreground">
                {done ? "Download complete!" : `Bundling your assets... ${Math.round(progress)}%`}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
