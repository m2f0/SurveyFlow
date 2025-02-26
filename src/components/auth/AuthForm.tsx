import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

type AuthMode = "signin" | "signup";

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
      } else if (mode === "signup") {
        // Verify stripe session first
        const { data: sessionData, error: sessionError } = await supabase
          .from("stripe_sessions")
          .select("*")
          .eq("status", "verified")
          .eq("email", formData.email)
          .single();

        if (sessionError || !sessionData) {
          throw new Error(
            "Please complete payment before registration. If you've already paid, please wait a few moments for verification.",
          );
        }

        // Proceed with registration
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              phone: formData.phone,
            },
          },
        });
        if (error) throw error;

        // Update session status to used
        await supabase
          .from("stripe_sessions")
          .update({ status: "used" })
          .eq("id", sessionData.id);

        // Clear form
        setFormData({
          email: "",
          password: "",
          name: "",
          phone: "",
        });

        // Switch to sign in mode
        setMode("signin");

        // Show success message
        toast({
          title: "Account created successfully!",
          description: "You can now sign in with your credentials.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    // Get the current URL of your application
    const currentUrl = window.location.origin;
    console.log("Current URL:", currentUrl);

    // Create the success and cancel URLs with session ID
    const successUrl = encodeURIComponent(
      `${currentUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    );
    const cancelUrl = encodeURIComponent(`${currentUrl}?checkout=canceled`);

    console.log("Success URL:", decodeURIComponent(successUrl));
    console.log("Cancel URL:", decodeURIComponent(cancelUrl));

    // Use the test Stripe URL with query parameters
    const stripeUrl = `https://buy.stripe.com/test_8wM4gQdCW04z9fa3cc?success_url=${successUrl}&cancel_url=${cancelUrl}`;
    console.log("Full Stripe URL:", stripeUrl);

    // Redirect to Stripe checkout
    window.location.href = stripeUrl;
  };

  // Check for success or cancel parameters in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    console.log("URL Params:", Object.fromEntries(params.entries()));
    console.log("Session ID:", sessionId);

    if (params.get("checkout") === "success" && sessionId) {
      // Check if session exists and is verified
      const checkSession = async () => {
        try {
          console.log("Checking session:", sessionId);
          const { data: sessionData, error: sessionError } = await supabase
            .from("stripe_sessions")
            .select("*")
            .eq("session_id", sessionId)
            .single();

          console.log("Session data:", sessionData);
          console.log("Session error:", sessionError);

          if (sessionError) throw sessionError;

          if (sessionData?.status === "verified") {
            setMode("signup");
            toast({
              title: "Payment successful!",
              description: "Please complete your registration.",
            });
          } else {
            throw new Error("Payment verification pending");
          }
        } catch (error) {
          console.error("Error checking session:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description:
              "There was an error verifying your payment. Please try again in a few moments.",
          });
        }
      };

      checkSession();
    } else if (params.get("checkout") === "canceled") {
      setMode("signin");
      toast({
        variant: "destructive",
        title: "Payment canceled",
        description: "Your payment was not completed.",
      });
    }
  }, [toast]);

  return (
    <Card className="w-full max-w-md p-6 space-y-6 bg-card relative z-10">
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="SurveyFlow AI Logo"
            className="w-24 h-24 rounded-2xl"
          />
        </div>
        <h1 className="text-2xl font-bold">Welcome to SurveyFlow AI!</h1>
        <p className="text-muted-foreground">
          {mode === "signin"
            ? "Sign in to your account"
            : "Create a new account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
        </div>

        <Button className="w-full" type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          onClick={
            mode === "signin" ? handleSignUpClick : () => setMode("signin")
          }
        >
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </Button>
      </div>
    </Card>
  );
}
