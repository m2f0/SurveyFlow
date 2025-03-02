import React, { Suspense } from "react";
import { useRoutes, Navigate, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import AuthForm from "./components/auth/AuthForm";
import tempoRoutes from "tempo-routes";
import appRoutes from "./routes";
import { useAuth } from "./lib/hooks/useAuth";
import { increaseUserCredits } from "./lib/supabase/users";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";

function App() {
  const { toast } = useToast();
  const { user, loading, initialized } = useAuth();
  // Use the routes
  const tempo =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(tempoRoutes) : null;

  // Handle payment success and force campaigns as the initial tab
  React.useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);

      // Handle payment success
      if (params.get("payment") === "success") {
        // Verify payment with backend and update credits
        const verifyPayment = async () => {
          try {
            // Get user email
            const userEmail = user.email;

            // Call backend to verify payment and update credits
            const response = await fetch(
              "https://surveyflowai-162119fdccd1.herokuapp.com/stripe/verify-credits-purchase",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  user_id: user.id,
                  email: userEmail,
                }),
              },
            );

            const data = await response.json();

            if (!response.ok)
              throw new Error(data.error || "Verification failed");

            // Update local credits display
            toast({
              title: "Credits Added",
              description: `${data.credits_added || 14500} credits have been added to your account!`,
            });
          } catch (error: any) {
            console.error("Error verifying payment:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description:
                error.message || "Failed to verify payment and add credits",
            });
          }
        };
        verifyPayment();

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
            <Routes>
              <Route path="/*" element={<Home />} />
            </Routes>
            {tempo}
          </div>
        </div>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
