import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Plan from "./pages/Plan";
import Register from "./pages/Register";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import GoalCatalog from "./pages/GoalCatalog";
import Login from "./pages/Login";
import Diagnostic from "./pages/Diagnostic";
import NotFound from "./pages/NotFound";
import TabNavigation from "./components/layout/TabNavigation";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/diagnostic" element={<Diagnostic />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
              <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
              <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/goal-catalog" element={<ProtectedRoute><GoalCatalog /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <TabNavigation />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
