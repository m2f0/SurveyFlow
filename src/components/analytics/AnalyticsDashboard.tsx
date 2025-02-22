import React from "react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Badge } from "../ui/badge";

interface AnalyticsDashboardProps {
  responseData?: Array<{
    date: string;
    responses: number;
    engagement: number;
  }>;
  emailStats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
}

const defaultResponseData = [
  { date: "2024-01-01", responses: 65, engagement: 78 },
  { date: "2024-01-02", responses: 72, engagement: 82 },
  { date: "2024-01-03", responses: 85, engagement: 88 },
  { date: "2024-01-04", responses: 78, engagement: 75 },
  { date: "2024-01-05", responses: 90, engagement: 92 },
];

const defaultEmailStats = {
  sent: 1000,
  delivered: 980,
  opened: 654,
  clicked: 321,
};

const AnalyticsDashboard = ({
  responseData = defaultResponseData,
  emailStats = defaultEmailStats,
}: AnalyticsDashboardProps) => {
  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <Badge variant="secondary">
            Last Updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Email Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Emails Sent</div>
            <div className="text-2xl font-bold">{emailStats.sent}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Delivered</div>
            <div className="text-2xl font-bold">{emailStats.delivered}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Opened</div>
            <div className="text-2xl font-bold">{emailStats.opened}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Clicked</div>
            <div className="text-2xl font-bold">{emailStats.clicked}</div>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="responses" className="w-full">
          <TabsList>
            <TabsTrigger value="responses">Response Rates</TabsTrigger>
            <TabsTrigger value="engagement">Engagement Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="responses">
            <Card className="p-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={responseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="responses"
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card className="p-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="engagement" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
