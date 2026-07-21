import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MobileBottomNav from "@/components/MobileBottomNav";
import { AuthProvider } from "@/hooks/useAuth";
import { LegacyRedirect } from "@/components/nova/LegacyRedirect";

// Marketing + auth
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";
import PublicSalesPage from "./pages/PublicSalesPage";
import NotFound from "./pages/NotFound";
import OAuthConsent from "./pages/OAuthConsent";

// Nova (MVP 2.0 primary journey)
import OnboardingChat from "./pages/nova/OnboardingChat";
import NovaDashboard from "./pages/nova/NovaDashboard";
import ProjectWorkspace from "./pages/nova/ProjectWorkspace";
import MissionsHub from "./pages/nova/MissionsHub";
import MissionWorkspace from "./pages/nova/MissionWorkspace";
import CoachHome from "./pages/nova/CoachHome";
import LaunchAssets from "./pages/nova/LaunchAssets";

// Legacy "Power Tools" (all still functional; mounted under /tools/*)
import Dashboard from "./pages/Dashboard";
import CreateToolkit from "./pages/CreateToolkit";
import ToolkitBuilder from "./pages/ToolkitBuilder";
import MyToolkits from "./pages/MyToolkits";
import Research from "./pages/Research";
import Discover from "./pages/Discover";
import Launch from "./pages/Launch";
import Settings from "./pages/Settings";
import EmpireMode from "./pages/EmpireMode";
import MicroFactory from "./pages/MicroFactory";
import LaunchWizard from "./pages/LaunchWizard";
import LaunchTemplates from "./pages/LaunchTemplates";
import Products from "./pages/Products";
import Funnels from "./pages/Funnels";
import MarketingAssets from "./pages/MarketingAssets";
import LaunchChecklist from "./pages/LaunchChecklist";
import Templates from "./pages/Templates";
import StealThisLaunch from "./pages/StealThisLaunch";
import ResearchAgent from "./pages/ResearchAgent";
import OpportunityRadar from "./pages/OpportunityRadar";
import ProfitRadar from "./pages/ProfitRadar";
import ShopifyLaunch from "./pages/ShopifyLaunch";
import AdLab from "./pages/AdLab";
import CloneCompetitor from "./pages/CloneCompetitor";
import SavedProjects from "./pages/SavedProjects";
import GenomeLibrary from "./pages/GenomeLibrary";
import AffiliatePredictor from "./pages/AffiliatePredictor";
import CommandCenter from "./pages/CommandCenter";
import SalesCopyEngine from "./pages/SalesCopyEngine";
import EmailEngine from "./pages/EmailEngine";
import SocialEngine from "./pages/SocialEngine";
import FunnelSimulation from "./pages/FunnelSimulation";
import TrafficPlanner from "./pages/TrafficPlanner";
import Analytics from "./pages/Analytics";
import Integrations from "./pages/Integrations";
import AgentHub from "./pages/AgentHub";
import ProfitMap from "./pages/ProfitMap";
import TemplatesMarketplace from "./pages/TemplatesMarketplace";

const queryClient = new QueryClient();

// Legacy path -> /tools/* target. Both patterns must include the same params.
const LEGACY_ROUTES: { legacy: string; target: string; element: JSX.Element }[] = [
  { legacy: "/opportunities", target: "/tools/opportunities", element: <ProfitRadar /> },
  { legacy: "/opportunities-legacy", target: "/tools/opportunities-legacy", element: <OpportunityRadar /> },
  { legacy: "/shopify-launch", target: "/tools/shopify-launch", element: <ShopifyLaunch /> },
  { legacy: "/ad-lab", target: "/tools/ad-lab", element: <AdLab /> },
  { legacy: "/clone-competitor", target: "/tools/clone-competitor", element: <CloneCompetitor /> },
  { legacy: "/saved-projects", target: "/tools/saved-projects", element: <SavedProjects /> },
  { legacy: "/command-center", target: "/tools/command-center", element: <CommandCenter /> },
  { legacy: "/command-center/:projectId", target: "/tools/command-center/:projectId", element: <CommandCenter /> },
  { legacy: "/genome", target: "/tools/genome", element: <GenomeLibrary /> },
  { legacy: "/wizard", target: "/tools/wizard", element: <LaunchWizard /> },
  { legacy: "/wizard/:projectId", target: "/tools/wizard/:projectId", element: <LaunchWizard /> },
  { legacy: "/sales-copy", target: "/tools/sales-copy", element: <SalesCopyEngine /> },
  { legacy: "/email-engine", target: "/tools/email-engine", element: <EmailEngine /> },
  { legacy: "/social-engine", target: "/tools/social-engine", element: <SocialEngine /> },
  { legacy: "/launch-templates", target: "/tools/launch-templates", element: <LaunchTemplates /> },
  { legacy: "/products", target: "/tools/products", element: <Products /> },
  { legacy: "/funnels", target: "/tools/funnels", element: <Funnels /> },
  { legacy: "/funnel-simulation", target: "/tools/funnel-simulation", element: <FunnelSimulation /> },
  { legacy: "/profit-map", target: "/tools/profit-map", element: <ProfitMap /> },
  { legacy: "/assets", target: "/tools/assets", element: <MarketingAssets /> },
  { legacy: "/checklist", target: "/tools/checklist", element: <LaunchChecklist /> },
  { legacy: "/affiliate-predictor", target: "/tools/affiliate-predictor", element: <AffiliatePredictor /> },
  { legacy: "/traffic-planner", target: "/tools/traffic-planner", element: <TrafficPlanner /> },
  { legacy: "/analytics", target: "/tools/analytics", element: <Analytics /> },
  { legacy: "/integrations", target: "/tools/integrations", element: <Integrations /> },
  { legacy: "/agent-hub", target: "/tools/agent-hub", element: <AgentHub /> },
  { legacy: "/steal", target: "/tools/steal", element: <StealThisLaunch /> },
  { legacy: "/research-agent", target: "/tools/research-agent", element: <ResearchAgent /> },
  { legacy: "/templates", target: "/tools/templates", element: <Templates /> },
  { legacy: "/create", target: "/tools/create", element: <CreateToolkit /> },
  { legacy: "/toolkit/:id", target: "/tools/toolkit/:id", element: <CreateToolkit /> },
  { legacy: "/toolkit/builder", target: "/tools/toolkit/builder", element: <ToolkitBuilder /> },
  { legacy: "/toolkit/builder/:id", target: "/tools/toolkit/builder/:id", element: <ToolkitBuilder /> },
  { legacy: "/my-toolkits", target: "/tools/my-toolkits", element: <MyToolkits /> },
  { legacy: "/research", target: "/tools/research", element: <Research /> },
  { legacy: "/discover", target: "/tools/discover", element: <Discover /> },
  { legacy: "/launch", target: "/tools/launch", element: <Launch /> },
  { legacy: "/launch/:id", target: "/tools/launch/:id", element: <Launch /> },
  { legacy: "/empire", target: "/tools/empire", element: <EmpireMode /> },
  { legacy: "/empire/:id", target: "/tools/empire/:id", element: <EmpireMode /> },
  { legacy: "/micro-factory", target: "/tools/micro-factory", element: <MicroFactory /> },
  { legacy: "/templates-marketplace", target: "/tools/templates-marketplace", element: <TemplatesMarketplace /> },
  { legacy: "/dashboard-legacy", target: "/tools/dashboard-legacy", element: <Dashboard /> },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Marketing + auth */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/p/:slug" element={<PublicSalesPage />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />

            {/* Nova (MVP 2.0 primary journey) */}
            <Route path="/onboarding" element={<OnboardingChat />} />
            <Route path="/dashboard" element={<NovaDashboard />} />
            <Route path="/coach" element={<CoachHome />} />
            <Route path="/project/:projectId" element={<MissionsHub />} />
            <Route path="/project/:projectId/coach" element={<ProjectWorkspace />} />
            <Route path="/project/:projectId/m/:missionId" element={<MissionWorkspace />} />
            <Route path="/project/:projectId/launch-assets" element={<LaunchAssets />} />

            {/* Settings stays at /settings (single-source) */}
            <Route path="/settings" element={<Settings />} />

            {/* Power Tools canonical routes */}
            {LEGACY_ROUTES.map((r) => (
              <Route key={r.target} path={r.target} element={r.element} />
            ))}

            {/* Legacy path -> /tools/* redirect (preserves ?query and #hash) */}
            {LEGACY_ROUTES.map((r) => (
              <Route
                key={`redir-${r.legacy}`}
                path={r.legacy}
                element={<LegacyRedirect to={r.target} />}
              />
            ))}

            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileBottomNav />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
