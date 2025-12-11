import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Package, Plus, Search, Filter, Loader2, 
  Calendar, Eye, MoreVertical, Trash2, Copy,
  CheckCircle2, Circle, Clock, AlertCircle, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProductBuild } from "@/types/productBuild";
import { PlaybookProgress } from "@/types/playbook";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const MyProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "complete" | "in_progress">("all");

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_product_builds")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Type-safe mapping
      const mappedProducts: ProductBuild[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        niche_id: item.niche_id,
        niche_name: item.niche_name,
        product_type: item.product_type,
        product_name: item.product_name,
        target_audience: item.target_audience,
        transformation_focus: item.transformation_focus,
        style_vibe: item.style_vibe,
        price_tier: item.price_tier,
        blueprint: item.blueprint,
        bundles: item.bundles,
        launch_kit: item.launch_kit,
        ecovers: item.ecovers,
        status: item.status,
        completion_steps: item.completion_steps,
        playbook_progress: item.playbook_progress as PlaybookProgress | undefined,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_product_builds")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product deleted");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const getCompletionCount = (steps: ProductBuild["completion_steps"]) => {
    return Object.values(steps).filter(Boolean).length;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.niche_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 text-center">
          <p className="text-muted-foreground">Please sign in to view your products.</p>
          <Button onClick={() => navigate("/auth")} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
                <Package className="w-8 h-8 text-primary" />
                My Products
              </h1>
              <p className="text-muted-foreground mt-1">
                {products.length} product{products.length !== 1 ? 's' : ''} created
              </p>
            </div>
            <Button onClick={() => navigate("/discover")} className="gap-2">
              <Plus className="w-4 h-4" />
              Create New Product
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "complete", "in_progress"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "all" ? "All" : status === "complete" ? "Complete" : "In Progress"}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start creating your first digital product by exploring trending niches.
              </p>
              <Button onClick={() => navigate("/discover")} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Your First Product
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{product.product_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{product.niche_name}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-md hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/niche/${product.niche_id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Niche
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(product.blueprint, null, 2));
                          toast.success("Blueprint copied!");
                        }}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Blueprint
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteProduct(product.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Personalization Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {product.target_audience}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {product.style_vibe}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
                      {product.price_tier}
                    </span>
                  </div>

                  {/* Completion Status */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">
                        {getCompletionCount(product.completion_steps)}/4
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Object.entries(product.completion_steps).map(([key, completed]) => (
                        <div
                          key={key}
                          className={`flex-1 h-1.5 rounded-full ${
                            completed ? 'bg-primary' : 'bg-secondary'
                          }`}
                          title={key}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Object.entries(product.completion_steps).map(([key, completed]) => (
                        <span
                          key={key}
                          className={`flex items-center gap-1 ${
                            completed ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                                  {key}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Playbook Progress */}
                          {product.playbook_progress && (
                            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
                              <Target className="w-4 h-4 text-primary flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium">
                                  First Sale: {product.playbook_progress.completedSteps?.length || 0}/12
                                </p>
                              </div>
                              {product.playbook_progress.completedAt && (
                                <span className="text-xs text-green-400">🎉 Done</span>
                              )}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(product.created_at).toLocaleDateString()}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              product.status === 'complete'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {product.status === 'complete' ? '✓ Complete' : '⏳ In Progress'}
                            </span>
                          </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyProducts;
