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
      <AnimatedBackground />

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-bold text-xl">Survey AI</div>
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
        <div className="p-4 border-t space-y-4">
          <div className="flex items-center justify-between">
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
