import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BuildingProvider, useBuilding } from "@/contexts/BuildingContext";
import Index from "./pages/Index";
import SignInPage from "./pages/SignInPage";
import TodayLogPage from "./pages/TodayLogPage";
import SearchPage from "./pages/SearchPage";
import SessionsPage from "./pages/SessionsPage";
import SessionDetailPage from "./pages/SessionDetailPage";
import HostsPage from "./pages/HostsPage";
import AllVisitorsPage from "./pages/AllVisitorsPage";
import BuildingSelectPage from "./pages/BuildingSelectPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentBuilding, isLoading } = useBuilding();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentBuilding) {
    return <Navigate to="/select-building" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/select-building" element={<BuildingSelectPage />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/sign-in" element={<ProtectedRoute><SignInPage /></ProtectedRoute>} />
      <Route path="/today" element={<ProtectedRoute><TodayLogPage /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
      <Route path="/session/:id" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />
      <Route path="/all-visitors" element={<ProtectedRoute><AllVisitorsPage /></ProtectedRoute>} />
      <Route path="/hosts" element={<ProtectedRoute><HostsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/*
        `import.meta.env.BASE_URL` will be set to the `base` value from
        vite.config.ts (e.g. "/visitracks/"). Using it as the
        `basename` ensures React Router prefixes all routes correctly when
        the app is served from a subdirectory.
      */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <BuildingProvider>
          <AppRoutes />
        </BuildingProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
