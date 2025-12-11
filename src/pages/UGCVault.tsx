import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, Layers, Calculator, Rocket, Crown, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { UGCAppCard } from '@/components/ugc/UGCAppCard';
import { UGCAppFilters } from '@/components/ugc/UGCAppFilters';
import { UGCAppDetailModal } from '@/components/ugc/UGCAppDetailModal';
import { UGCMyStack } from '@/components/ugc/UGCMyStack';
import { UGCIncomeEstimator } from '@/components/ugc/UGCIncomeEstimator';
import { UGCQuickStart } from '@/components/ugc/UGCQuickStart';
import { UGCAppCardSkeleton } from '@/components/skeletons/UGCAppCardSkeleton';
import BlurOverlay from '@/components/BlurOverlay';
import { UGCApp, UGCAppFilters as FilterState, UGCUserStatus } from '@/types/ugcVault';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function UGCVault() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isPro = role === 'pro';

  const [apps, setApps] = useState<UGCApp[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, UGCUserStatus>>({});
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<UGCApp | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    category: null,
    contentType: null,
    platform: null,
    payModel: null,
    followersRequired: null,
    beginnerFriendly: false
  });

  useEffect(() => {
    fetchApps();
    if (user) {
      fetchUserStatuses();
    }
  }, [user]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ugc_apps')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('beginner_friendly_score', { ascending: false });

      if (error) throw error;
      setApps((data || []) as unknown as UGCApp[]);
    } catch (error) {
      console.error('Error fetching apps:', error);
      toast({
        title: 'Error',
        description: 'Failed to load UGC apps',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatuses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ugc_user_app_status')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const statusMap: Record<string, UGCUserStatus> = {};
      const notesMap: Record<string, string> = {};
      
      (data || []).forEach((status: any) => {
        statusMap[status.app_id] = status.status as UGCUserStatus;
        if (status.notes) notesMap[status.app_id] = status.notes;
      });

      setUserStatuses(statusMap);
      setUserNotes(notesMap);
    } catch (error) {
      console.error('Error fetching user statuses:', error);
    }
  };

  const toggleBookmark = async (app: UGCApp) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to bookmark apps',
        variant: 'destructive'
      });
      return;
    }

    setBookmarkingId(app.id);
    const currentStatus = userStatuses[app.id];

    try {
      if (currentStatus) {
        // Remove bookmark
        const { error } = await supabase
          .from('ugc_user_app_status')
          .delete()
          .eq('user_id', user.id)
          .eq('app_id', app.id);

        if (error) throw error;

        setUserStatuses(prev => {
          const next = { ...prev };
          delete next[app.id];
          return next;
        });
        toast({ title: 'Removed', description: 'App removed from your stack' });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('ugc_user_app_status')
          .insert({
            user_id: user.id,
            app_id: app.id,
            status: 'BOOKMARKED'
          });

        if (error) throw error;

        setUserStatuses(prev => ({ ...prev, [app.id]: 'BOOKMARKED' }));
        toast({ title: 'Saved', description: 'App added to your stack' });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark',
        variant: 'destructive'
      });
    } finally {
      setBookmarkingId(null);
    }
  };

  const updateAppStatus = async (status: UGCUserStatus) => {
    if (!user || !selectedApp) return;

    try {
      const { error } = await supabase
        .from('ugc_user_app_status')
        .upsert({
          user_id: user.id,
          app_id: selectedApp.id,
          status
        }, { onConflict: 'user_id,app_id' });

      if (error) throw error;

      setUserStatuses(prev => ({ ...prev, [selectedApp.id]: status }));
      toast({ title: 'Updated', description: 'Status updated' });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const updateAppNotes = async (notes: string) => {
    if (!user || !selectedApp) return;

    try {
      const { error } = await supabase
        .from('ugc_user_app_status')
        .upsert({
          user_id: user.id,
          app_id: selectedApp.id,
          notes,
          status: userStatuses[selectedApp.id] || 'BOOKMARKED'
        }, { onConflict: 'user_id,app_id' });

      if (error) throw error;

      setUserNotes(prev => ({ ...prev, [selectedApp.id]: notes }));
      toast({ title: 'Saved', description: 'Notes saved' });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({ title: 'Error', description: 'Failed to save notes', variant: 'destructive' });
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.contentType) count++;
    if (filters.platform) count++;
    if (filters.payModel) count++;
    if (filters.followersRequired) count++;
    if (filters.beginnerFriendly) count++;
    return count;
  }, [filters]);

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      if (filters.category && !app.category.includes(filters.category)) return false;
      if (filters.contentType && !app.content_types.includes(filters.contentType)) return false;
      if (filters.platform && !app.platforms.includes(filters.platform)) return false;
      if (filters.payModel && !app.pay_model.includes(filters.payModel)) return false;
      if (filters.followersRequired && app.followers_required !== filters.followersRequired) return false;
      if (filters.beginnerFriendly && app.beginner_friendly_score < 4) return false;
      return true;
    });
  }, [apps, filters]);

  // Free users see limited apps
  const displayApps = isPro ? filteredApps : filteredApps.filter(app => app.is_featured).slice(0, 3);

  const openAppDetail = (app: UGCApp) => {
    setSelectedApp(app);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
            UGC App Vault
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Turn Your Phone Into a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              UGC Income Hub
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover apps that pay you to create UGC. No followers required — just your creativity.
          </p>
        </motion.div>

        {/* Pro Upgrade Banner for Free Users */}
        {!isPro && (
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-accent" />
                <div>
                  <p className="font-semibold">Unlock All {apps.length}+ UGC Apps</p>
                  <p className="text-sm text-muted-foreground">
                    Free users can only see 3 featured apps
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/pricing')}>
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto">
            <TabsTrigger value="discover" className="gap-2">
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
            </TabsTrigger>
            <TabsTrigger value="my-stack" className="gap-2" disabled={!isPro}>
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">My Stack</span>
              {!isPro && <Lock className="w-3 h-3" />}
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2" disabled={!isPro}>
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculator</span>
              {!isPro && <Lock className="w-3 h-3" />}
            </TabsTrigger>
            <TabsTrigger value="quick-start" className="gap-2">
              <Rocket className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Start</span>
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Filters */}
            <UGCAppFilters 
              filters={filters}
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
            />

            {/* App Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <UGCAppCardSkeleton key={i} />
                ))}
              </div>
            ) : displayApps.length === 0 ? (
              <Card className="bg-card/50">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No apps match your filters</p>
                  <Button 
                    variant="link" 
                    onClick={() => setFilters({
                      category: null,
                      contentType: null,
                      platform: null,
                      payModel: null,
                      followersRequired: null,
                      beginnerFriendly: false
                    })}
                  >
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayApps.map((app) => (
                    <UGCAppCard
                      key={app.id}
                      app={app}
                      userStatus={userStatuses[app.id]}
                      onViewDetails={openAppDetail}
                      onToggleBookmark={toggleBookmark}
                      isBookmarking={bookmarkingId === app.id}
                    />
                  ))}
                </div>

                {/* Blur overlay for remaining apps (free users) */}
                {!isPro && filteredApps.length > 3 && (
                  <div className="mt-4">
                    <BlurOverlay 
                      title={`${filteredApps.length - 3} more apps available`}
                      description="Upgrade to Pro to unlock all UGC apps and tracking features"
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* My Stack Tab */}
          <TabsContent value="my-stack">
            {isPro ? (
              <UGCMyStack onViewApp={openAppDetail} />
            ) : (
              <Card className="bg-card/50">
                <CardContent className="p-8 text-center">
                  <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Pro Feature</h3>
                  <p className="text-muted-foreground mb-4">
                    Track your applications and estimated earnings with My Stack
                  </p>
                  <Button onClick={() => navigate('/pricing')}>Upgrade to Pro</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            {isPro ? (
              <UGCIncomeEstimator />
            ) : (
              <Card className="bg-card/50">
                <CardContent className="p-8 text-center">
                  <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Pro Feature</h3>
                  <p className="text-muted-foreground mb-4">
                    Calculate your potential UGC income with our estimator
                  </p>
                  <Button onClick={() => navigate('/pricing')}>Upgrade to Pro</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Quick Start Tab */}
          <TabsContent value="quick-start">
            <UGCQuickStart />
          </TabsContent>
        </Tabs>
      </main>

      {/* App Detail Modal */}
      <UGCAppDetailModal
        app={selectedApp}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        userStatus={selectedApp ? userStatuses[selectedApp.id] : null}
        userNotes={selectedApp ? userNotes[selectedApp.id] : undefined}
        onStatusChange={updateAppStatus}
        onNotesChange={updateAppNotes}
        onToggleBookmark={() => selectedApp && toggleBookmark(selectedApp)}
      />
    </div>
  );
}
