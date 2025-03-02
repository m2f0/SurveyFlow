import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";
import { Loader2, Save, CreditCard, AlertCircle } from "lucide-react";
import AnimatedBackground from "../layout/AnimatedBackground";

const ProfileManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });

        setCredits(data.credits || 0);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load profile",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, toast]);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("users")
        .update({
          name: profile.name,
          phone: profile.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async () => {
    try {
      // Get the current URL of your application
      const currentUrl = window.location.origin;

      // Create the success and cancel URLs
      const successUrl = `${currentUrl}?payment=success`;
      const cancelUrl = `${currentUrl}?payment=canceled`;

      // Call backend API to create credits purchase
      const response = await fetch(
        "https://surveyflowai-162119fdccd1.herokuapp.com/stripe/create-credits-purchase",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_email: profile.email,
            quantity: 1, // Default quantity
            success_url: successUrl,
            cancel_url: cancelUrl,
          }),
        },
      );

      const data = await response.json();

      if (data.error) throw new Error(data.error);
      if (!data.url) throw new Error("No checkout URL returned");

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create checkout session",
      });
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen relative">
      <div className="absolute inset-0 z-0 opacity-50">
        <AnimatedBackground />
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <Badge variant="outline" className="px-3 py-1">
            Credits: {credits.toLocaleString()}
          </Badge>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled={true}
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="mt-4"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-0">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Current Credits</h3>
                  <div className="text-3xl font-bold">
                    {credits.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Credits are used for generating AI responses
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Purchase Credits</h3>

                  <Card className="p-4 border-2 border-primary/20 bg-primary/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">37,000 Credits</h4>
                        <p className="text-sm text-muted-foreground">
                          Approximately 37 detailed AI responses
                        </p>
                      </div>
                      <div className="text-xl font-bold">$29</div>
                    </div>

                    <Button onClick={handleBuyCredits} className="w-full mt-4">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Purchase Now
                    </Button>
                  </Card>

                  <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>
                      Credits never expire and can be used for any AI response
                      generation in the platform.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileManager;
