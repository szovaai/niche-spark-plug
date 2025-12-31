import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, Plus, Download, Trash2, MoreVertical, 
  Clock, CheckCircle, Edit, ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Toolkit {
  id: string;
  title: string;
  subtitle: string | null;
  niche: string;
  status: string;
  downloads: number;
  ecover_url: string | null;
  created_at: string;
  updated_at: string;
}

const MyToolkits = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchToolkits();
    }
  }, [user]);

  const fetchToolkits = async () => {
    try {
      const { data, error } = await supabase
        .from("toolkits")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setToolkits(data || []);
    } catch (error) {
      console.error("Error fetching toolkits:", error);
      toast({
        title: "Error",
        description: "Failed to load toolkits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase.from("toolkits").delete().eq("id", deleteId);
      if (error) throw error;

      setToolkits(prev => prev.filter(t => t.id !== deleteId));
      toast({
        title: "Toolkit Deleted",
        description: "Your toolkit has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting toolkit:", error);
      toast({
        title: "Error",
        description: "Failed to delete toolkit.",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <DashboardLayout title="My Toolkits">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Toolkits</h1>
            <p className="text-muted-foreground">
              {toolkits.length} toolkit{toolkits.length !== 1 ? "s" : ""} created
            </p>
          </div>
          <Button onClick={() => navigate("/create")} variant="hero" className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Toolkit
          </Button>
        </div>

        {/* Toolkits Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : toolkits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Toolkits Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first digital product toolkit and start selling on WarriorPlus.
            </p>
            <Button onClick={() => navigate("/create")} variant="hero" size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Your First Toolkit
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolkits.map((toolkit, i) => (
              <motion.div
                key={toolkit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden hover:border-primary/30 transition-all group h-full">
                  {/* Ecover Preview */}
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                    {toolkit.ecover_url ? (
                      <img 
                        src={toolkit.ecover_url} 
                        alt={toolkit.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                      toolkit.status === 'complete'
                        ? 'bg-green-500/90 text-white'
                        : 'bg-yellow-500/90 text-black'
                    }`}>
                      {toolkit.status === 'complete' ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Complete
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{toolkit.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{toolkit.niche}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/toolkit/${toolkit.id}`)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/create?edit=${toolkit.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteId(toolkit.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(toolkit.updated_at), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Download className="w-3 h-3" />
                        {toolkit.downloads}
                      </span>
                    </div>

                    <Button 
                      variant={toolkit.status === 'complete' ? "hero" : "outline"}
                      className="w-full"
                      onClick={() => navigate(`/toolkit/${toolkit.id}`)}
                    >
                      {toolkit.status === 'complete' ? (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Continue Editing
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Toolkit?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your toolkit 
              and all associated content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default MyToolkits;
