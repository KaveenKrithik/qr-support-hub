
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import AuthLayout from "./layouts/AuthLayout";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import OnboardingPage from "./pages/auth/OnboardingPage";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import RequestDetailsPage from "./pages/requests/RequestDetailsPage";
import ProfilePage from "./pages/profile/ProfilePage";
import QrScanPage from "./pages/QrScanPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="srm-support-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
          <Route path="/onboarding" element={<AuthLayout><OnboardingPage /></AuthLayout>} />
          <Route path="/qr/:departmentId?" element={<QrScanPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route path="student" element={<StudentDashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="superadmin" element={<SuperAdminDashboard />} />
          </Route>
          <Route path="/requests/:id" element={<ProtectedRoute><RequestDetailsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          {/* Index route */}
          <Route path="/index" element={<Index />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
