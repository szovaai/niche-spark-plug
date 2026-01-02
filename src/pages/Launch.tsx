import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Rocket, PartyPopper, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LaunchHeader } from "@/components/launch/LaunchHeader";
import { PlatformSelector } from "@/components/launch/PlatformSelector";
import { LaunchStepList } from "@/components/launch/LaunchStepList";
import { QuickExport } from "@/components/launch/QuickExport";
import { OutsourceSection } from "@/components/launch/OutsourceSection";
import { FreeHostingSection } from "@/components/launch/FreeHostingSection";
import { LaunchPlatform, LaunchChecklist, ToolkitLaunchData } from "@/types/launch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import confetti from "canvas-confetti";

// Hub view component - shows all toolkits
const LaunchHub = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [toolkits, setToolkits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchToolkits();
  }, [user, authLoading]);

  const fetchToolkits = async () => {
    const { data } = await supabase
      .from("toolkits")
      .select("id, title, niche, status, ecover_url, created_at")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    setToolkits(data || []);
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout title="Launch Hub">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const completedToolkits = toolkits.filter(t => t.status === "complete");
  const draftToolkits = toolkits.filter(t => t.status === "draft");

  return (
    <DashboardLayout title="Launch Hub">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Rocket className="w-8 h-8 text-primary" />
            Launch Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Select a toolkit to start your launch journey
          </p>
        </div>

        {toolkits.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Toolkits Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first toolkit to start your launch journey.
            </p>
            <Button onClick={() => navigate("/create")}>
              Create Toolkit
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {completedToolkits.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">Ready to Launch</Badge>
                </h2>
                <div className="grid gap-4">
                  {completedToolkits.map((toolkit) => (
                    <Card 
                      key={toolkit.id} 
                      className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => navigate(`/launch/${toolkit.id}`)}
                    >
                      <CardContent className="p-0 flex items-center gap-4">
                        {toolkit.ecover_url ? (
                          <img src={toolkit.ecover_url} alt="" className="w-16 h-20 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{toolkit.title}</h3>
                          <p className="text-sm text-muted-foreground">{toolkit.niche}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="w-5 h-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {draftToolkits.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="secondary">In Progress</Badge>
                </h2>
                <div className="grid gap-4">
                  {draftToolkits.map((toolkit) => (
                    <Card 
                      key={toolkit.id} 
                      className="p-4 cursor-pointer hover:border-primary/50 transition-colors opacity-70"
                      onClick={() => navigate(`/create?edit=${toolkit.id}`)}
                    >
                      <CardContent className="p-0 flex items-center gap-4">
                        <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{toolkit.title || "Untitled Toolkit"}</h3>
                          <p className="text-sm text-muted-foreground">{toolkit.niche || "No niche set"}</p>
                          <p className="text-xs text-amber-500 mt-1">Complete this toolkit to launch</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Continue Building
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Single toolkit launch view
const LaunchToolkit = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [toolkit, setToolkit] = useState<ToolkitLaunchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<LaunchPlatform | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progressId, setProgressId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    fetchToolkit();
    fetchProgress();
  }, [id, user, authLoading]);

  const fetchToolkit = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("toolkits")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Toolkit fetch error:", fetchError);
        setError("Could not load this toolkit. It may not exist or you don't have access.");
        setLoading(false);
        return;
      }

      setToolkit({
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        niche: data.niche,
        targetAudience: data.target_audience,
        ecoverUrl: data.ecover_url,
        salesLetter: data.sales_letter,
        components: data.components as Record<string, boolean>,
        content: data.content as Record<string, unknown>,
      });
      setLoading(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    const { data } = await supabase
      .from("launch_progress")
      .select("*")
      .eq("toolkit_id", id)
      .eq("user_id", user?.id)
      .single();

    if (data) {
      setProgressId(data.id);
      setSelectedPlatform(data.selected_platform as LaunchPlatform);
      setCompletedSteps(data.completed_steps || []);
    }
  };

  const saveProgress = async (platform: LaunchPlatform | null, steps: string[]) => {
    if (!user || !id) return;

    const progressData = {
      toolkit_id: id,
      user_id: user.id,
      selected_platform: platform,
      completed_steps: steps,
      updated_at: new Date().toISOString(),
    };

    if (progressId) {
      await supabase.from("launch_progress").update(progressData).eq("id", progressId);
    } else {
      const { data } = await supabase.from("launch_progress").insert(progressData).select().single();
      if (data) setProgressId(data.id);
    }
  };

  const handlePlatformSelect = (platform: LaunchPlatform) => {
    setSelectedPlatform(platform);
    saveProgress(platform, completedSteps);
  };

  const handleStepToggle = (stepId: string) => {
    const newSteps = completedSteps.includes(stepId)
      ? completedSteps.filter(s => s !== stepId)
      : [...completedSteps, stepId];
    
    setCompletedSteps(newSteps);
    saveProgress(selectedPlatform, newSteps);
  };

  const handleMarkAsLaunched = async () => {
    if (!progressId) return;
    
    await supabase.from("launch_progress").update({
      launched_at: new Date().toISOString(),
    }).eq("id", progressId);

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    toast.success("Congratulations! Your product is launched! 🎉");
  };

  const checklist: LaunchChecklist = {
    hasGuide: !!(toolkit?.content && Object.keys(toolkit.content).length > 0),
    hasBonuses: !!(toolkit?.components && Object.values(toolkit.components).filter(Boolean).length > 1),
    hasCover: !!toolkit?.ecoverUrl,
    hasSalesLetter: !!toolkit?.salesLetter,
    hasPrice: true,
    hasProductName: !!toolkit?.title,
  };

  if (error) {
    return (
      <DashboardLayout title="Launch">
        <div className="max-w-md mx-auto text-center py-16">
          <Rocket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Toolkit Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/my-toolkits")}>
            Back to My Toolkits
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (authLoading || loading || !toolkit) {
    return (
      <DashboardLayout title="Launch">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Launch Your Toolkit">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <Button variant="ghost" onClick={() => navigate("/launch")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Launch Hub
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
            <Rocket className="w-8 h-8 text-primary" />
            Launch Your Toolkit
          </h1>
          <p className="text-muted-foreground mt-2">
            From finished assets → first sale (step by step)
          </p>
        </div>

        <LaunchHeader toolkit={toolkit} checklist={checklist} />
        <QuickExport toolkit={toolkit} platform={selectedPlatform} />
        <PlatformSelector selectedPlatform={selectedPlatform} onSelect={handlePlatformSelect} />
        
        {selectedPlatform && (
          <LaunchStepList
            platform={selectedPlatform}
            completedSteps={completedSteps}
            onStepToggle={handleStepToggle}
          />
        )}

        {/* Free Hosting Section */}
        <FreeHostingSection />

        {/* Outsource Section */}
        <OutsourceSection platform={selectedPlatform} />

        {selectedPlatform && completedSteps.length > 10 && (
          <div className="text-center p-8 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl border border-primary/30">
            <PartyPopper className="w-12 h-12 mx-auto text-amber-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Ready to Celebrate?</h3>
            <p className="text-muted-foreground mb-4">
              You've completed most of the steps. Mark your product as launched!
            </p>
            <Button onClick={handleMarkAsLaunched} size="lg" className="bg-gradient-to-r from-primary to-purple-500">
              Mark as Launched 🎉
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Main component - routes between hub and single toolkit view
const Launch = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <LaunchHub />;
  }
  
  return <LaunchToolkit id={id} />;
};

export default Launch;
