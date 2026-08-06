import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { CustomCursor } from '@/components/shared/CustomCursor';
import { MouseGradient } from '@/components/shared/MouseGradient';
import { PS4Background } from '@/components/shared/PS4Background';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ComplaintListPage = lazy(() => import('@/pages/complaints/ComplaintListPage'));
const AIAnalysisPage = lazy(() => import('@/pages/ai-analysis/AIAnalysisPage'));
const CustomerDashboard = lazy(() => import('@/pages/customer/CustomerDashboard'));
const SubmitComplaintPage = lazy(() => import('@/pages/customer/SubmitComplaintPage'));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#e11d48] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#737370] font-['JetBrains_Mono'] tracking-[0.05em]">
          Loading...
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (isAuthenticated) {
    if (user?.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <AuthRedirect>
            <Suspense fallback={<LoadingFallback />}>
              <LoginPage />
            </Suspense>
          </AuthRedirect>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRedirect>
            <Suspense fallback={<LoadingFallback />}>
              <RegisterPage />
            </Suspense>
          </AuthRedirect>
        }
      />

      {/* Staff routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'support']}>
            <SidebarProvider>
              <StaffLayout />
            </SidebarProvider>
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="/complaints"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ComplaintListPage />
            </Suspense>
          }
        />
        <Route
          path="/ai-analysis"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AIAnalysisPage />
            </Suspense>
          }
        />
      </Route>

      {/* Customer routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/customer/dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <CustomerDashboard />
            </Suspense>
          }
        />
        <Route
          path="/customer/submit"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SubmitComplaintPage />
            </Suspense>
          }
        />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-[#e11d48] mb-4">404</h1>
              <p className="text-[#737370] mb-6">Page not found</p>
              <a
                href="/login"
                className="px-6 py-2 bg-[#e11d48] text-white rounded-2xl hover:shadow-lg transition-all"
              >
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomCursor />
        <MouseGradient />
        <PS4Background />
        <div className="noise-overlay" />
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e0e0da',
              color: '#0a0a0a',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
