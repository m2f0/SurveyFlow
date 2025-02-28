import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  FileText,
  Mail,
  BarChart2,
  Menu,
  ChevronLeft,
  User,
  LogOut,
  Upload,
  CreditCard,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedBackground } from "./AnimatedBackground";
import { useAuth } from "@/lib/hooks/useAuth";

interface TabChangeHandler {
  (tab: string): void;
}

interface SidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
  onTabChange?: TabChangeHandler;
  onToggle?: () => void;
  isVisible?: boolean;
}

const navItems = [
  { icon: Mail, label: "Campaigns", path: "campaigns", primary: true },
  { icon: Upload, label: "Upload", path: "upload" },
  { icon: FileText, label: "Responses", path: "responses" },
  { icon: BarChart2, label: "Analytics", path: "analytics" },
];

const Sidebar = ({
  className = "",
  defaultCollapsed = false,
  onTabChange = () => {},
  onToggle = () => {},
  isVisible = true,
}: SidebarProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("credits")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setCredits(data?.credits || 0);
      } catch (error) {
        console.error("Error fetching credits:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch credits",
        });
      }
    };

    fetchCredits();

    // Set up polling for credits
    const pollInterval = setInterval(fetchCredits, 2000); // Poll every 2 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [user?.id, toast]);

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-background border-r transition-transform duration-300",
        isVisible ? "translate-x-0" : "-translate-x-full",
        "w-64",
        className,
      )}
    >
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
      </div>

      <div className="flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="SurveyFlow AI Logo"
              className="w-8 h-8 rounded-lg"
            />
            <div className="font-bold text-xl">SurveyFlow AI</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-9 w-9 rounded-md p-0"
          >
            <ChevronLeft className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-3">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  onClick={() => {
                    setActiveTab(item.path);
                    onTabChange(item.path);
                  }}
                  className={cn(
                    "w-full justify-start px-4",
                    activeTab === item.path ? "bg-accent" : "",
                    item.primary
                      ? "bg-[#0F172A] text-white hover:text-white hover:bg-[#0F172A]/90"
                      : "",
                  )}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button
            variant="default"
            className="w-full flex items-center justify-center gap-2 mb-4"
            onClick={async () => {
              try {
                // Get the current URL of your application
                const currentUrl =
                  "https://inspiring-murdock8-q55sp.dev-2.tempolabs.ai";
                console.log("Current URL:", currentUrl);

                // Create the success and cancel URLs
                const successUrl = `${currentUrl}?payment=success`;
                const cancelUrl = `${currentUrl}?payment=canceled`;
                console.log("Success URL:", successUrl);
                console.log("Cancel URL:", cancelUrl);

                // Call our create-checkout function
                const response = await fetch(
                  "https://slridxiczocmupyjgaek.supabase.co/functions/v1/create-checkout-session",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                      success_url: successUrl,
                      cancel_url: cancelUrl,
                    }),
                  },
                );

                const data = await response.json();
                console.log("Response:", data);

                if (data.error) throw new Error(data.error);
                if (!data.url) throw new Error("No checkout URL returned");

                // Redirect to Stripe checkout
                window.location.href = data.url;
              } catch (error: any) {
                console.error("Error creating checkout session:", error);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description:
                    error.message || "Failed to create checkout session",
                });
              }
            }}
          >
            <CreditCard className="h-4 w-4" />
            Buy Credits
          </Button>

          <div className="flex items-center justify-between mb-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="h-9 w-9 rounded-md p-0"
              onClick={() => {
                setActiveTab("profile");
                onTabChange("profile");
              }}
            >
              <User className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
              <span className="sr-only">Profile</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="h-9 w-9 rounded-md p-0"
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  toast({
                    variant: "destructive",
                    title: "Error signing out",
                    description: error.message,
                  });
                }
              }}
            >
              <LogOut className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <span>Available Credits</span>
            <span className="font-medium">{credits.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
