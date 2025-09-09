import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
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
import NotFound from "./pages/NotFound";
import TabNavigation from "./components/layout/TabNavigation";
import { AppSidebar } from "./components/layout/AppSidebar";
import ProtectedRoute from "./components/layout/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <AppSidebar />
                    <main className="flex-1 flex flex-col">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/plan" element={<Plan />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/analysis" element={<Analysis />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/goal-catalog" element={<GoalCatalog />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <TabNavigation />
                    </main>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
