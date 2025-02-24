import React, { Suspense } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import Home from "./components/home";
import AuthForm from "./components/auth/AuthForm";
import routes from "tempo-routes";
import { useAuth } from "./lib/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";

function App() {
  const { user, loading } = useAuth();
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  // Force campaigns as the initial tab
  React.useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("tab")) {
        window.history.replaceState({}, "", "?tab=campaigns");
      }
    }
  }, [user]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-background relative overflow-hidden">
        <AnimatedBackground />
        <p className="text-lg relative z-10">Loading...</p>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return (
      <>
        <div className="flex items-center justify-center w-full min-h-screen bg-background relative overflow-hidden">
          <AnimatedBackground />
          <AuthForm />
        </div>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center w-full h-screen bg-background">
            <p className="text-lg">Loading...</p>
          </div>
        }
      >
        <div className="relative overflow-hidden">
          <AnimatedBackground />
          <div className="relative z-10">
            <Home />
            {tempoRoutes}
          </div>
        </div>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
