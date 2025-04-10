
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import OnboardingPage from './pages/auth/OnboardingPage';
import QrScanPage from './pages/QrScanPage';
import ProfilePage from './pages/profile/ProfilePage';
import RequestDetailsPage from './pages/requests/RequestDetailsPage';
import NotFound from './pages/NotFound';

// Dashboard pages by role
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import { useAuth } from '@/hooks/useSupabaseAuth';

const App = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <svg
          className="h-12 w-12 animate-spin text-primary"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
    );
  }
  
  return (
    <ThemeProvider defaultTheme="light" storageKey="srm-support-theme">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } 
        />
        
        {/* QR Scan route */}
        <Route 
          path="/qr" 
          element={
            <ProtectedRoute>
              <QrScanPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/qr/:departmentId" 
          element={
            <ProtectedRoute>
              <QrScanPage />
            </ProtectedRoute>
          }
        />
        
        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                {user ? (
                  <Navigate to={`/dashboard/${user.role}`} replace /> 
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading your dashboard...</p>
                  </div>
                )}
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/superadmin"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <DashboardLayout>
                <SuperAdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/requests/:requestId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <RequestDetailsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
};

export default App;
