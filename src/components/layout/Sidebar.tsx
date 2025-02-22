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
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface SidebarProps {
  className?: string;
  defaultCollapsed?: boolean;
}

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Responses", path: "/responses" },
  { icon: Mail, label: "Campaigns", path: "/campaigns" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
];

const Sidebar = ({
  className = "",
  defaultCollapsed = false,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const navigate = useNavigate();

  // Animated background pattern
  const Pattern = () => (
    <div className="absolute inset-0 overflow-hidden opacity-10">
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
    <div
      className={cn(
        "relative h-screen bg-background border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <Pattern />

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {!isCollapsed && <div className="font-bold text-xl">Survey AI</div>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
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
                  className={cn(
                    "w-full justify-start",
                    isCollapsed ? "px-2" : "px-4",
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <Icon
                    className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-between">
          <Button
            variant="ghost"
            className={cn(
              "justify-start",
              isCollapsed ? "px-2 w-full" : "px-4 flex-1",
            )}
          >
            <Menu className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
            {!isCollapsed && <span>Menu</span>}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
