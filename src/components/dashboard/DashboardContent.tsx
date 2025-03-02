import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import AnimatedBackground from "../layout/AnimatedBackground";
import CampaignManager from "../email/CampaignManager";
import CSVUploader from "../upload/CSVUploader";
import ResponsePanel from "../responses/ResponsePanel";
import AnalyticsDashboard from "../analytics/AnalyticsDashboard";
import ProfileManager from "../profile/ProfileManager";

interface DashboardContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardContent = ({
  activeTab,
  onTabChange,
}: DashboardContentProps) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const handleDataParsed = (data: any[], info: any) => {
    setCsvData(data);
    setFileInfo(info);
  };

  const handleCampaignSelect = (campaign: any) => {
    setSelectedCampaign(campaign);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 z-0 opacity-50">
        <AnimatedBackground />
      </div>

      <div className="relative z-10">
        {activeTab === "campaigns" && (
          <CampaignManager onCampaignSelect={handleCampaignSelect} />
        )}

        {activeTab === "upload" && (
          <CSVUploader
            onDataParsed={handleDataParsed}
            initialFileInfo={fileInfo}
          />
        )}

        {activeTab === "responses" && (
          <ResponsePanel
            responses={csvData}
            companyName="SurveyFlow AI"
            signature={selectedCampaign?.signature}
            responseSize={selectedCampaign?.response_size}
            campaignType={selectedCampaign?.campaign_type}
            campaignId={selectedCampaign?.id}
          />
        )}

        {activeTab === "analytics" && <AnalyticsDashboard />}

        {activeTab === "profile" && <ProfileManager />}
      </div>
    </div>
  );
};

export default DashboardContent;
