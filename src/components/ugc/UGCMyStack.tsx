import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, FileText, CheckCircle, PlayCircle, PauseCircle, DollarSign, Edit, Trash2 } from 'lucide-react';
import { UGCApp, UGCUserAppStatus, UGCUserStatus, STATUS_LABELS } from '@/types/ugcVault';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface StackItem {
  status: UGCUserAppStatus;
  app: UGCApp;
}

interface UGCMyStackProps {
  onViewApp: (app: UGCApp) => void;
}

export function UGCMyStack({ onViewApp }: UGCMyStackProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stackItems, setStackItems] = useState<StackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchStack();
    }
  }, [user]);

  const fetchStack = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: statuses, error: statusError } = await supabase
        .from('ugc_user_app_status')
        .select('*')
        .eq('user_id', user.id);

      if (statusError) throw statusError;

      if (!statuses || statuses.length === 0) {
        setStackItems([]);
        setLoading(false);
        return;
      }

      const appIds = statuses.map(s => s.app_id);
      const { data: apps, error: appsError } = await supabase
        .from('ugc_apps')
        .select('*')
        .in('id', appIds);

      if (appsError) throw appsError;

      const items: StackItem[] = statuses.map(status => ({
        status: status as unknown as UGCUserAppStatus,
        app: apps?.find(a => a.id === status.app_id) as unknown as UGCApp
      })).filter(item => item.app);

      setStackItems(items);
    } catch (error) {
      console.error('Error fetching stack:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your stack',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEstimatedMonthly = async (statusId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('ugc_user_app_status')
        .update({ estimated_monthly: amount })
        .eq('id', statusId);

      if (error) throw error;

      setStackItems(prev => prev.map(item => 
        item.status.id === statusId 
          ? { ...item, status: { ...item.status, estimated_monthly: amount } }
          : item
      ));
      setEditingId(null);
      toast({ title: 'Updated', description: 'Estimated monthly updated' });
    } catch (error) {
      console.error('Error updating:', error);
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
    }
  };

  const removeFromStack = async (statusId: string) => {
    try {
      const { error } = await supabase
        .from('ugc_user_app_status')
        .delete()
        .eq('id', statusId);

      if (error) throw error;

      setStackItems(prev => prev.filter(item => item.status.id !== statusId));
      toast({ title: 'Removed', description: 'App removed from your stack' });
    } catch (error) {
      console.error('Error removing:', error);
      toast({ title: 'Error', description: 'Failed to remove', variant: 'destructive' });
    }
  };

  const getStatusIcon = (status: UGCUserStatus) => {
    switch (status) {
      case 'BOOKMARKED': return <Bookmark className="w-4 h-4" />;
      case 'APPLIED': return <FileText className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'ACTIVE': return <PlayCircle className="w-4 h-4" />;
      case 'ON_PAUSE': return <PauseCircle className="w-4 h-4" />;
      default: return <Bookmark className="w-4 h-4" />;
    }
  };

  const filterByStatus = (status: UGCUserStatus | 'all') => {
    if (status === 'all') return stackItems;
    return stackItems.filter(item => item.status.status === status);
  };

  const totalEstimatedMonthly = stackItems.reduce((sum, item) => sum + (item.status.estimated_monthly || 0), 0);

  const renderStackItem = (item: StackItem) => (
    <Card key={item.status.id} className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* App Icon */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {item.app.name.charAt(0)}
          </div>

          {/* App Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">{item.app.name}</h4>
              <Badge variant="outline" className="text-xs shrink-0">
                {getStatusIcon(item.status.status as UGCUserStatus)}
                <span className="ml-1">{STATUS_LABELS[item.status.status as UGCUserStatus]}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{item.app.short_tagline}</p>
          </div>

          {/* Estimated Monthly */}
          <div className="flex items-center gap-2 shrink-0">
            {editingId === item.status.id ? (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(Number(e.target.value))}
                  className="w-20 h-8"
                />
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => updateEstimatedMonthly(item.status.id, editValue)}
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Est. Monthly</p>
                  <p className="font-semibold text-green-400">
                    ${item.status.estimated_monthly || 0}
                  </p>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => {
                    setEditingId(item.status.id);
                    setEditValue(item.status.estimated_monthly || 0);
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 shrink-0">
            <Button size="sm" variant="outline" onClick={() => onViewApp(item.app)}>
              View
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-destructive"
              onClick={() => removeFromStack(item.status.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {item.status.notes && (
          <p className="text-sm text-muted-foreground mt-2 pl-14 italic">
            "{item.status.notes}"
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Estimated */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Total Estimated Monthly</p>
              <p className="text-3xl font-bold text-foreground">${totalEstimatedMonthly}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            From {stackItems.filter(i => i.status.status === 'ACTIVE').length} active apps
          </p>
        </CardContent>
      </Card>

      {/* Stack Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All ({stackItems.length})</TabsTrigger>
          <TabsTrigger value="BOOKMARKED">Saved ({filterByStatus('BOOKMARKED').length})</TabsTrigger>
          <TabsTrigger value="APPLIED">Applied ({filterByStatus('APPLIED').length})</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved ({filterByStatus('APPROVED').length})</TabsTrigger>
          <TabsTrigger value="ACTIVE">Active ({filterByStatus('ACTIVE').length})</TabsTrigger>
        </TabsList>

        {['all', 'BOOKMARKED', 'APPLIED', 'APPROVED', 'ACTIVE'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-3">
            {filterByStatus(status as UGCUserStatus | 'all').length === 0 ? (
              <Card className="bg-card/50">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No apps in this category yet</p>
                </CardContent>
              </Card>
            ) : (
              filterByStatus(status as UGCUserStatus | 'all').map(renderStackItem)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
