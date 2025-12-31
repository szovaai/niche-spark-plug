import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Loader2, TrendingUp, Flame, Star, ExternalLink,
  Eye, Sparkles, DollarSign, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MarketProduct, MarketScanResult, MarketInsights } from "@/types/marketScanner";

interface StoreSpyScannerProps {
  onAnalyzeProduct?: (url: string) => void;
  onCreateSimilar?: (product: MarketProduct) => void;
}

const StoreSpyScanner = ({ onAnalyzeProduct, onCreateSimilar }: StoreSpyScannerProps) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MarketScanResult | null>(null);
  const [marketplaces, setMarketplaces] = useState<{ etsy: boolean; gumroad: boolean }>({
    etsy: true,
    gumroad: true,
  });

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setLoading(true);
    try {
      const marketplace = marketplaces.etsy && marketplaces.gumroad 
        ? 'all' 
        : marketplaces.etsy 
          ? 'etsy' 
          : 'gumroad';

      const { data, error } = await supabase.functions.invoke("market-scanner", {
        body: { query, marketplace, limit: 12 },
      });

      if (error) throw error;
      
      if (data.success) {
        setResults(data.data);
        toast.success(`Found ${data.data.products.length} products`);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      console.error("Error scanning marketplace:", err);
      toast.error("Failed to scan marketplace");
    } finally {
      setLoading(false);
    }
  };

  const getSalesSignalIcon = (signal: MarketProduct['salesSignal']) => {
    switch (signal) {
      case 'hot':
        return <Flame className="w-3 h-3 text-orange-400" />;
      case 'rising':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      default:
        return <Star className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getSalesSignalLabel = (signal: MarketProduct['salesSignal']) => {
    switch (signal) {
      case 'hot':
        return 'Top Seller';
      case 'rising':
        return 'Rising';
      default:
        return 'Steady';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for digital products (e.g., productivity planner, marketing templates)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Spy
              </>
            )}
          </Button>
        </div>

        {/* Marketplace Toggles */}
        <div className="flex items-center gap-6">
          <span className="text-sm text-muted-foreground">Search on:</span>
          <div className="flex items-center gap-2">
            <Checkbox
              id="etsy"
              checked={marketplaces.etsy}
              onCheckedChange={(checked) => 
                setMarketplaces(prev => ({ ...prev, etsy: !!checked }))
              }
            />
            <label htmlFor="etsy" className="text-sm font-medium cursor-pointer flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Etsy
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="gumroad"
              checked={marketplaces.gumroad}
              onCheckedChange={(checked) => 
                setMarketplaces(prev => ({ ...prev, gumroad: !!checked }))
              }
            />
            <label htmlFor="gumroad" className="text-sm font-medium cursor-pointer flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              Gumroad
            </label>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-32" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="space-y-6">
          {/* Insights Panel */}
          {results.insights && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg"
            >
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                Market Insights for "{results.query}"
              </h3>
              
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-2 bg-background/50 rounded">
                  <DollarSign className="w-4 h-4 mx-auto text-green-400 mb-1" />
                  <p className="text-lg font-bold">{results.insights.avgPrice}</p>
                  <p className="text-xs text-muted-foreground">Avg Price</p>
                </div>
                <div className="text-center p-2 bg-background/50 rounded">
                  <TrendingUp className="w-4 h-4 mx-auto text-ocean-400 mb-1" />
                  <p className="text-lg font-bold">
                    ${results.insights.priceRange.min} - ${results.insights.priceRange.max}
                  </p>
                  <p className="text-xs text-muted-foreground">Price Range</p>
                </div>
                <div className="text-center p-2 bg-background/50 rounded">
                  <Target className="w-4 h-4 mx-auto text-magenta-400 mb-1" />
                  <p className="text-lg font-bold">{results.totalFound}</p>
                  <p className="text-xs text-muted-foreground">Products Found</p>
                </div>
                <div className="text-center p-2 bg-background/50 rounded">
                  <Flame className="w-4 h-4 mx-auto text-orange-400 mb-1" />
                  <p className="text-lg font-bold">
                    {results.products.filter(p => p.salesSignal === 'hot').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Top Sellers</p>
                </div>
              </div>

              {/* Patterns and Opportunities */}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {results.insights.topPatterns.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-1">Common Patterns:</p>
                    <div className="flex flex-wrap gap-1">
                      {results.insights.topPatterns.map((pattern, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {results.insights.opportunities.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-1">Gap Opportunities:</p>
                    <div className="flex flex-wrap gap-1">
                      {results.insights.opportunities.map((opp, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-green-500/50 text-green-400">
                          {opp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`group overflow-hidden hover:border-primary/50 transition-all ${
                  product.salesSignal === 'hot' ? 'ring-1 ring-orange-500/30' : ''
                }`}>
                  {/* Thumbnail */}
                  {product.thumbnail && (
                    <div className="relative h-32 bg-secondary overflow-hidden">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {/* Sales Signal Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            product.salesSignal === 'hot' 
                              ? 'bg-orange-500/90 text-white' 
                              : product.salesSignal === 'rising' 
                                ? 'bg-green-500/90 text-white'
                                : ''
                          }`}
                        >
                          {getSalesSignalIcon(product.salesSignal)}
                          <span className="ml-1">{getSalesSignalLabel(product.salesSignal)}</span>
                        </Badge>
                      </div>
                      {/* Marketplace Badge */}
                      <div className="absolute top-2 right-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            product.marketplace === 'etsy' 
                              ? 'border-orange-500/50 bg-orange-500/10 text-orange-400' 
                              : 'border-pink-500/50 bg-pink-500/10 text-pink-400'
                          }`}
                        >
                          {product.marketplace === 'etsy' ? 'Etsy' : 'Gumroad'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* No thumbnail fallback */}
                  {!product.thumbnail && (
                    <div className="h-32 bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                      <span className={`text-4xl ${
                        product.marketplace === 'etsy' ? 'text-orange-400' : 'text-pink-400'
                      }`}>
                        {product.marketplace === 'etsy' ? '🛒' : '✨'}
                      </span>
                    </div>
                  )}

                  <CardContent className="p-4 space-y-3">
                    {/* Title */}
                    <h4 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                      {product.title}
                    </h4>

                    {/* Price and Reviews */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {product.price}
                      </span>
                      {product.reviews && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {product.reviews.toLocaleString()} reviews
                        </span>
                      )}
                    </div>

                    {/* Seller */}
                    <p className="text-xs text-muted-foreground truncate">
                      by {product.seller}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => window.open(product.url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {onAnalyzeProduct && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => onAnalyzeProduct(product.url)}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Analyze
                        </Button>
                      )}
                      {onCreateSimilar && (
                        <Button 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => onCreateSimilar(product)}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Create
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {results.products.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try a different search term or marketplace combination
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!results && !loading && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Spy on the Competition</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Search for digital products on Etsy and Gumroad to see what's selling, 
            discover price points, and find opportunities.
          </p>
        </div>
      )}
    </div>
  );
};

export default StoreSpyScanner;
