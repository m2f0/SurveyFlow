import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AuthMode = "signin" | "signup";

export default function AuthForm() {
  // Check URL parameters for mode
  const getInitialMode = (): AuthMode => {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "signup" ? "signup" : "signin";
  };

  const [mode, setMode] = useState<AuthMode>(getInitialMode());
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessionCheckInProgress, setSessionCheckInProgress] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        setSuccess("Login successful! Redirecting to dashboard...");
        navigate("/dashboard");
      } else if (mode === "signup") {
        // Get the current URL of your application
        const currentUrl = window.location.origin;

        // Create the success and cancel URLs
        const successUrl = `${currentUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${currentUrl}/?checkout=canceled`;

        // Call backend API to create subscription
        const response = await fetch(
          "https://surveyflowai-162119fdccd1.herokuapp.com/stripe/create-subscription",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customer_email: formData.email,
              success_url: successUrl,
              cancel_url: cancelUrl,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create subscription");
        }

        const data = await response.json();

        if (!data.url) throw new Error("No checkout URL returned");

        // Store form data in session storage for later use
        sessionStorage.setItem(
          "signupFormData",
          JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            phone: formData.phone,
          }),
        );

        // Redirect to Stripe checkout
        window.location.href = data.url;
        return;
      }
    } catch (error: any) {
      setError(error.message);
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
    setMode("signup");
  };

  // Check for success or cancel parameters in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");
    const sessionId = params.get("session_id");

    // Clear URL parameters without refreshing the page
    const cleanUrl = () => {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, document.title, url.toString());
    };

    if (checkoutStatus === "success" && sessionId) {
      setSessionCheckInProgress(true);
      setLoading(true);

      // Check if session exists and is verified with backend
      const checkSession = async () => {
        try {
          const response = await fetch(
            `https://surveyflowai-162119fdccd1.herokuapp.com/stripe/verify-session?session_id=${sessionId}`,
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Verification failed");
          }

          const data = await response.json();

          if (data.verified) {
            // Get stored form data
            const storedFormData = JSON.parse(
              sessionStorage.getItem("signupFormData") || "{}",
            );

            // Generate a secure password if none provided
            const password =
              storedFormData.password ||
              Math.random().toString(36).slice(-10) +
                Math.random().toString(36).toUpperCase().slice(-2) +
                "!2";

            // Create user in Supabase
            try {
              // Validar o email antes de tentar criar o usuário
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(data.customer_email)) {
                throw new Error(`Email inválido: ${data.customer_email}`);
              }

              console.log(
                "Attempting to sign up with email:",
                data.customer_email,
              );

              // First, sign up the user with Supabase Auth
              const { data: userData, error: signupError } =
                await supabase.auth.signUp({
                  email: data.customer_email.trim(),
                  password: password,
                  options: {
                    data: {
                      name: storedFormData.name || "New User",
                      phone: storedFormData.phone || "",
                    },
                  },
                });

              if (signupError) throw signupError;

              console.log("User created in Auth:", userData);

              // Wait a moment to ensure Auth user is fully created
              await new Promise((resolve) => setTimeout(resolve, 1000));

              // Verificar se o usuário já existe na tabela users antes de criar
              if (userData?.user) {
                try {
                  // Primeiro verificar se o usuário já existe na tabela users
                  const { data: existingUser, error: checkError } =
                    await supabaseAdmin
                      .from("users")
                      .select("id, email")
                      .eq("email", data.customer_email.trim())
                      .maybeSingle();

                  if (existingUser) {
                    console.log(
                      "User already exists in users table with email:",
                      existingUser.email,
                    );

                    // Se o ID for diferente, atualize para o novo ID do Auth
                    if (existingUser.id !== userData.user.id) {
                      console.log(
                        "Updating user ID in users table to match Auth ID",
                      );
                      await supabaseAdmin
                        .from("users")
                        .update({ id: userData.user.id })
                        .eq("email", data.customer_email.trim());
                    }
                  } else {
                    // Usuário não existe, criar com lock para evitar duplicação
                    console.log("User not found in users table, creating now");

                    // Usar a função create_new_user para garantir integridade
                    const { data: insertData, error: insertError } =
                      await supabaseAdmin.rpc("create_new_user", {
                        user_id: userData.user.id,
                        user_email: data.customer_email.trim(),
                        user_name: storedFormData.name || "New User",
                        user_phone: storedFormData.phone || "",
                        initial_credits: 37000,
                      });

                    if (insertError) {
                      if (insertError.code === "23505") {
                        // Código de erro para violação de chave única
                        console.log(
                          "User was created by another process, skipping",
                        );
                      } else {
                        console.error(
                          "Error creating user in users table:",
                          insertError,
                        );
                      }
                    } else {
                      console.log(
                        "User successfully created in users table:",
                        insertData,
                      );
                    }
                  }
                } catch (error) {
                  console.error(
                    "Failed to check/create user in users table:",
                    error,
                  );
                  // Continue mesmo com erro, pois o usuário já foi criado no Auth
                }
              }
            } catch (error) {
              console.error("Error creating user:", error);
              setError(
                "Account created but profile setup failed. Please contact support.",
              );
              // Continue with the flow even if user creation fails
              // The user can sign up manually later
            }

            // Notify backend that user has completed registration
            const completeResponse = await fetch(
              "https://surveyflowai-162119fdccd1.herokuapp.com/stripe/complete-registration",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: data.customer_email,
                }),
              },
            );

            if (!completeResponse.ok) {
              const errorData = await completeResponse.json();
              throw new Error(
                errorData.error || "Failed to complete registration",
              );
            }

            // Clear stored form data
            sessionStorage.removeItem("signupFormData");

            // Redirect to login page
            setMode("signin");
            setSuccess(
              "Payment successful! Please sign in with your email and password.",
            );
            cleanUrl();
          } else {
            throw new Error("Payment verification pending");
          }
        } catch (error: any) {
          console.error("Error checking session:", error);
          setError(
            error.message || "There was an error verifying your payment",
          );
          toast({
            variant: "destructive",
            title: "Error",
            description:
              error.message || "There was an error verifying your payment",
          });
        } finally {
          setLoading(false);
          setSessionCheckInProgress(false);
        }
      };

      checkSession();
    } else if (checkoutStatus === "canceled") {
      setMode("signin");
      setError("Payment was canceled. Please try again when you're ready.");
      toast({
        variant: "destructive",
        title: "Payment canceled",
        description: "Your payment was not completed.",
      });
      cleanUrl();
    }
  }, [toast, navigate]);

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

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 p-3 rounded-md flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-md flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
          <p className="text-sm text-green-600 dark:text-green-500">
            {success}
          </p>
        </div>
      )}

      {/* Loading indicator for session check */}
      {sessionCheckInProgress ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-muted-foreground">
            Verifying your payment and creating your account...
          </p>
        </div>
      ) : (
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
                  disabled={loading}
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
                  disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      )}

      {!sessionCheckInProgress && (
        <div className="text-center">
          <Button
            variant="link"
            onClick={
              mode === "signin" ? handleSignUpClick : () => setMode("signin")
            }
            disabled={loading}
          >
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </div>
      )}
    </Card>
  );
}
