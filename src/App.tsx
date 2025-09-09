import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Plan from "./pages/Plan";
import Register from "./pages/Register";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import GoalCatalog from "./pages/GoalCatalog";
import NotFound from "./pages/NotFound";
import TabNavigation from "./components/layout/TabNavigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/register" element={<Register />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/goal-catalog" element={<GoalCatalog />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <TabNavigation />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
