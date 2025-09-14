import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import SignUp from "./SignUp"; // Importe a nova página
import Dashboard from "./pages/Dashboard";
import Plan from "./pages/Plan";
import Register from "./pages/Register";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import GoalCatalog from "./pages/GoalCatalog";
import GoalDetails from "./pages/GoalDetails";
import CategoryAnalysis from "./pages/CategoryAnalysis";
import WealthEvolution from "./pages/WealthEvolution";
import MyDiagnostic from "./pages/MyDiagnostic";
import ManageCategories from "./pages/ManageCategories";
import Login from "./pages/Login";
import Transactions from "./pages/Transactions";
import Diagnostic from "./pages/Diagnostic";
import NotFound from "./pages/NotFound";
import TabNavigation from "./components/layout/TabNavigation";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;
  }
  
  return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/onboarding" />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
        <Route path="/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/diagnostic" element={<ProtectedRoute><Diagnostic /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/goal-catalog" element={<ProtectedRoute><GoalCatalog /></ProtectedRoute>} />
        <Route path="/goal/:id" element={<ProtectedRoute><GoalDetails /></ProtectedRoute>} />
        <Route path="/analysis/category/:categoryId" element={<ProtectedRoute><CategoryAnalysis /></ProtectedRoute>} />
        <Route path="/wealth-evolution" element={<ProtectedRoute><WealthEvolution /></ProtectedRoute>} />
        <Route path="/my-diagnostic" element={<ProtectedRoute><MyDiagnostic /></ProtectedRoute>} />
        <Route path="/manage-categories" element={<ProtectedRoute><ManageCategories /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <TabNavigation />
    </>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen bg-background">
              <AppRoutes />
            </div>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
