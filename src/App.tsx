import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateToolkit from "./pages/CreateToolkit";
import ToolkitBuilder from "./pages/ToolkitBuilder";
import MyToolkits from "./pages/MyToolkits";
import Research from "./pages/Research";
import Discover from "./pages/Discover";
import Pricing from "./pages/Pricing";
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
import GenomeLibrary from "./pages/GenomeLibrary";
import AffiliatePredictor from "./pages/AffiliatePredictor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/opportunities" element={<OpportunityRadar />} />
            <Route path="/genome" element={<GenomeLibrary />} />
            <Route path="/wizard" element={<LaunchWizard />} />
            <Route path="/wizard/:projectId" element={<LaunchWizard />} />
            <Route path="/launch-templates" element={<LaunchTemplates />} />
            <Route path="/products" element={<Products />} />
            <Route path="/funnels" element={<Funnels />} />
            <Route path="/assets" element={<MarketingAssets />} />
            <Route path="/checklist" element={<LaunchChecklist />} />
            <Route path="/steal" element={<StealThisLaunch />} />
            <Route path="/research-agent" element={<ResearchAgent />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/create" element={<CreateToolkit />} />
            <Route path="/toolkit/:id" element={<CreateToolkit />} />
            <Route path="/toolkit/builder" element={<ToolkitBuilder />} />
            <Route path="/toolkit/builder/:id" element={<ToolkitBuilder />} />
            <Route path="/my-toolkits" element={<MyToolkits />} />
            <Route path="/research" element={<Research />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/launch" element={<Launch />} />
            <Route path="/launch/:id" element={<Launch />} />
            <Route path="/empire" element={<EmpireMode />} />
            <Route path="/empire/:id" element={<EmpireMode />} />
            <Route path="/micro-factory" element={<MicroFactory />} />
            <Route path="/affiliate-predictor" element={<AffiliatePredictor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
