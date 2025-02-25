import React, { Suspense } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import Home from "./components/home";
import AuthForm from "./components/auth/AuthForm";
import routes from "tempo-routes";
import { useAuth } from "./lib/hooks/useAuth";
import { increaseUserCredits } from "./lib/supabase/users";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";

function App() {
  const { toast } = useToast();
  const { user, loading, initialized } = useAuth();
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  // Handle payment success and force campaigns as the initial tab
  React.useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);

      // Handle payment success
      if (params.get("payment") === "success") {
        // Increase credits
        const increaseCredits = async () => {
          try {
            await increaseUserCredits(user.id);
            toast({
              title: "Credits Added",
              description: "37,000 credits have been added to your account!",
            });
          } catch (error: any) {
            console.error("Error increasing credits:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message || "Failed to add credits",
            });
          }
        };
        increaseCredits();

        // Remove payment parameter and set tab
        window.history.replaceState({}, "", "?tab=profile");
      } else if (params.get("payment") === "canceled") {
        toast({
          variant: "destructive",
          title: "Payment Canceled",
          description: "Your payment was not completed.",
        });
        // Remove payment parameter and set tab
        window.history.replaceState({}, "", "?tab=profile");
      } else if (!params.get("tab")) {
        // Set default tab if no tab is set
        window.history.replaceState({}, "", "?tab=campaigns");
      }
    }
  }, [user, toast]);

  // Show loading state
  if (loading || !initialized) {
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
