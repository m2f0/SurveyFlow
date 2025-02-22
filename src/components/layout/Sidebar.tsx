import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Home,
  FileText,
  Mail,
  BarChart2,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
  { icon: Home, label: "Upload", path: "upload" },
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
  const [activeTab, setActiveTab] = useState("campaigns");

  // Animated background pattern
  const Pattern = () => (
    <div className="absolute inset-0 overflow-hidden opacity-10 flex">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary rounded-full"
          initial={{
            x: Math.random() * 280,
            y: Math.random() * 982,
          }}
          animate={{
            x: Math.random() * 280,
            y: Math.random() * 982,
            transition: {
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            },
          }}
        />
      ))}
    </div>
  );

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-background border-r transition-transform duration-300",
        isVisible ? "translate-x-0" : "-translate-x-full",
        "w-64",
        className,
      )}
    >
      <Pattern />

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
        <div className="p-4 border-t flex items-center justify-between">
          <Button variant="ghost" className="justify-start px-4 flex-1">
            <Menu className="h-5 w-5 mr-2" />
            <span>Menu</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
