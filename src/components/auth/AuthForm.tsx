import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
    // Create the success and cancel URLs
    const successUrl = `${currentUrl}?checkout=success`;
    const cancelUrl = `${currentUrl}?checkout=canceled`;

    // Append the success_url and cancel_url as query parameters to the Stripe checkout URL
    const stripeUrl = new URL("https://buy.stripe.com/6oEcMTe4VeQffmw289");
    stripeUrl.searchParams.append("success_url", successUrl);
    stripeUrl.searchParams.append("cancel_url", cancelUrl);

    // Redirect to Stripe checkout
    window.location.href = stripeUrl.toString();
  };

  // Check for success or cancel parameters in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setMode("signup");
      toast({
        title: "Payment successful!",
        description: "Please complete your registration.",
      });
    } else if (params.get("checkout") === "canceled") {
      setMode("signin");
      toast({
        variant: "destructive",
        title: "Payment canceled",
        description: "Your payment was not completed.",
      });
    }
  }, []);

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
