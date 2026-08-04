import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import { NutritionProvider } from "@/providers/nutrition-context";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Foods from "./pages/Foods";
import Meals from "./pages/Meals";
import Goals from "./pages/Goals";
import Log from "./pages/Log";
import Profile from "./pages/Profile";
import ProfileSettings from "./pages/ProfileSettings";
import AIMealPlan from "./pages/AIMealPlan";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import MeusPlanos from "./pages/MeusPlanos";
import NutriCoach from "./pages/NutriCoach";
import More from "./pages/More";
import Onboarding from "./pages/Onboarding";
import SnapLog from "./pages/SnapLog";
import CaloricGoals from "./pages/CaloricGoals";
import ManualGoals from "./pages/ManualGoals";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DateCalendar from "./pages/DateCalendar";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";
  const isLandingRoute = location.pathname === "/landing";
  const isOnboardingRoute = location.pathname === "/onboarding";
  const isSnapLogRoute = location.pathname === "/snap-log";
  const isTermsRoute = location.pathname === "/terms";
  const isPrivacyRoute = location.pathname === "/privacy";

  const isPublicRoute = isLandingRoute || isOnboardingRoute || isTermsRoute || isPrivacyRoute;



  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }


  // Show public routes (landing, onboarding, terms, privacy)
  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    );
  }

  // Show snap log as a fullscreen route (needs authentication)
  if (isSnapLogRoute && user) {
    return (
      <NutritionProvider>
        <Routes>
          <Route path="/snap-log" element={<SnapLog />} />
        </Routes>
      </NutritionProvider>
    );
  }

  // If not authenticated and not on auth/public route, redirect to landing
  if (!user && !isAuthRoute && !isPublicRoute) {
    return <Navigate to="/landing" replace />;
  }

  // If authenticated and on auth/onboarding route, redirect to dashboard
  if (user && (isAuthRoute || isOnboardingRoute)) {
    return <Navigate to="/" replace />;
  }

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Fallbacks for direct hits */}
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <NutritionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/caloric-goals" element={<CaloricGoals />} />
          <Route path="/manual-goals" element={<ManualGoals />} />
          <Route path="/calendar" element={<DateCalendar />} />
          <Route path="/log" element={<Log />} />
          <Route path="/ai-meal-plan" element={<AIMealPlan />} />
          <Route path="/meus-planos" element={<MeusPlanos />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/nutri-coach" element={<NutriCoach />} />
          <Route path="/more" element={<More />} />
          <Route path="/profile" element={
            <ErrorBoundary>
              <Profile />
            </ErrorBoundary>
          } />
          <Route path="/profile-settings" element={
            <ErrorBoundary>
              <ProfileSettings />
            </ErrorBoundary>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </NutritionProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="nutritrack-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
