import React from "react";
import Sidebar from "./layout/Sidebar";
import DashboardContent from "./dashboard/DashboardContent";

interface HomeProps {
  defaultTab?: string;
}

const Home = ({ defaultTab = "upload" }: HomeProps) => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DashboardContent activeTab={defaultTab} />
      </main>
    </div>
  );
};

export default Home;
