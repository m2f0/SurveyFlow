import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Campaign } from "@/lib/supabase/campaigns";
import CSVUploader from "../upload/CSVUploader";
import ResponsePanel from "../responses/ResponsePanel.tsx";
import CampaignManager from "../email/CampaignManager";
import AnalyticsDashboard from "../analytics/AnalyticsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";

interface CSVData {
  [key: string]: string;
}

interface DashboardContentProps {
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

const DashboardContent = ({
  activeTab = "campaigns",
  onTabChange = () => {},
}: DashboardContentProps) => {
  const [responses, setResponses] = useState<CSVData[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [analyticsData, setAnalyticsData] = useState({
    responseData: [
      {
        date: new Date().toISOString().split("T")[0],
        responses: 0,
        engagement: 0,
      },
    ],
    emailStats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
    },
  });

  const handleCSVData = (data: CSVData[]) => {
    setResponses(data);
    // Update analytics with the new data
    setAnalyticsData({
      responseData: [
        {
          date: new Date().toISOString().split("T")[0],
          responses: data.length,
          engagement: Math.round(data.length * 0.8), // Simulated engagement rate
        },
      ],
      emailStats: {
        sent: data.length,
        delivered: Math.round(data.length * 0.98),
        opened: Math.round(data.length * 0.75),
        clicked: Math.round(data.length * 0.45),
      },
    });
    onTabChange("responses");
  };

  return (
    <div className="w-full min-h-screen bg-background p-4 lg:p-6">
      <Card className="w-full h-full bg-card">
        <Tabs value={activeTab} className="w-full" onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2">
            <TabsTrigger
              value="campaigns"
              className="bg-[#0F172A] text-white hover:text-white hover:bg-[#0F172A]/90 data-[state=active]:bg-[#0F172A] data-[state=active]:text-white"
            >
              Campaigns
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-accent"
            >
              CSV Upload
            </TabsTrigger>
            <TabsTrigger
              value="responses"
              className="data-[state=active]:bg-accent"
            >
              Responses
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-accent"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="upload" className="m-0">
              <CSVUploader onDataParsed={handleCSVData} />
            </TabsContent>

            <TabsContent value="responses" className="m-0">
              <ResponsePanel
                responses={responses}
                companyName={selectedCampaign?.company_name}
                companyDetails={selectedCampaign?.company_details}
                signature={selectedCampaign?.signature}
                responseSize={selectedCampaign?.response_size}
              />
            </TabsContent>

            <TabsContent value="campaigns" className="m-0">
              <CampaignManager onCampaignSelect={setSelectedCampaign} />
            </TabsContent>

            <TabsContent value="analytics" className="m-0">
              <AnalyticsDashboard
                responseData={analyticsData.responseData}
                emailStats={analyticsData.emailStats}
              />
            </TabsContent>
          </div>
        </Tabs>

        <Outlet />
      </Card>
    </div>
  );
};

export default DashboardContent;
