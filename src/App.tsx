import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Discover from "./pages/Discover";
import NicheDetail from "./pages/NicheDetail";
import Saved from "./pages/Saved";
import LaunchPacks from "./pages/LaunchPacks";
import Pricing from "./pages/Pricing";
import MyProducts from "./pages/MyProducts";
import MoneyMap from "./pages/MoneyMap";
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
            <Route path="/discover" element={<Discover />} />
            <Route path="/niche/:nicheId" element={<NicheDetail />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/launch-packs" element={<LaunchPacks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/my-products" element={<MyProducts />} />
            <Route path="/money-map" element={<MoneyMap />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
