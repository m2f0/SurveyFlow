import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Sidebar from "./layout/Sidebar";
import DashboardContent from "./dashboard/DashboardContent";

interface HomeProps {
  defaultTab?: string;
}

const Home = ({ defaultTab = "upload" }: HomeProps) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab);
  const [isSidebarVisible, setSidebarVisible] = React.useState(true);

  const handleSidebarToggle = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar
        onTabChange={setActiveTab}
        onToggle={handleSidebarToggle}
        isVisible={isSidebarVisible}
      />
      <main
        className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          isSidebarVisible ? "ml-64" : "ml-0",
        )}
      >
        {!isSidebarVisible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSidebarToggle}
            className="absolute top-4 left-4 z-50 h-9 w-9 rounded-md p-0 hover:bg-accent"
          >
            <ChevronRight className="h-[1.2rem] w-[1.2rem]" />
          </Button>
        )}
        <DashboardContent activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
};

export default Home;
