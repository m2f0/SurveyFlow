import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, User } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { AnimatedBackground } from "../layout/AnimatedBackground";

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  credits?: number;
}

export default function ProfileManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    phone: "",
    email: user?.email || "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        // Try to fetch existing user
        let { data: userData, error: fetchError } = await supabase
          .from("users")
          .select("credits")
          .eq("id", user.id)
          .single();

        // If user doesn't exist, create them
        if (fetchError?.code === "PGRST116") {
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([
              {
                id: user.id,
                email: user.email,
                name: user.user_metadata.name || "Anonymous User", // Default name since it's required
                phone: user.user_metadata.phone,
                credits: 1000, // Set initial credits when creating user,
              },
            ])
            .select("credits")
            .single();

          if (createError) {
            console.error("Error creating user:", createError);
            toast({
              variant: "destructive",
              title: "Error",
              description:
                "Could not create user profile: " + createError.message,
            });
            return;
          }

          userData = newUser;
        } else if (fetchError) {
          console.error("Error fetching user:", fetchError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch user data: " + fetchError.message,
          });
          return;
        }

        console.log("User data:", userData);

        setProfile({
          name: user.user_metadata.name || "",
          phone: user.user_metadata.phone || "",
          email: user.email || "",
          credits: userData?.credits ?? 1000,
        });
      } catch (error: any) {
        console.error("Unexpected error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred: " + error.message,
        });
      }
    };

    fetchUserData();
  }, [user, toast]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          phone: profile.phone,
        },
      });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
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

  return (
    <div className="w-full min-h-screen bg-background p-6 relative overflow-hidden">
      <AnimatedBackground />
      <div className="max-w-2xl mx-auto relative z-10">
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-full bg-primary/10">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1234567890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label>Available Credits</Label>
              <div className="flex items-center space-x-2 bg-muted p-3 rounded-md">
                <div className="text-2xl font-bold">
                  {profile.credits?.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  credits remaining
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleUpdateProfile}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
