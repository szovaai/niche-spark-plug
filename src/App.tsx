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
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
