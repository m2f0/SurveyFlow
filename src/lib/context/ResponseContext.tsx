import React, { createContext, useContext, useState } from "react";
import { TokenUsage } from "../openai";

interface AIResponse {
  id: string;
  content: string;
  status: "pending" | "generated" | "approved";
  usage: TokenUsage;
}

type ResponsesState = {
  responses: Record<string, Record<string, AIResponse>>;
  setResponsesForCampaign: (
    campaignId: string,
    responses: Record<string, AIResponse>,
  ) => void;
  getResponsesForCampaign: (campaignId: string) => Record<string, AIResponse>;
};

const ResponseContext = createContext<ResponsesState | undefined>(undefined);

export function ResponseProvider({ children }: { children: React.ReactNode }) {
  // Store responses by campaign ID
  const [responses, setResponses] = useState<
    Record<string, Record<string, AIResponse>>
  >({});

  const setResponsesForCampaign = (
    campaignId: string,
    campaignResponses: Record<string, AIResponse>,
  ) => {
    setResponses((prev) => ({
      ...prev,
      [campaignId]: campaignResponses,
    }));
  };

  const getResponsesForCampaign = (campaignId: string) => {
    return responses[campaignId] || {};
  };

  return (
    <ResponseContext.Provider
      value={{
        responses,
        setResponsesForCampaign,
        getResponsesForCampaign,
      }}
    >
      {children}
    </ResponseContext.Provider>
  );
}

export function useResponses() {
  const context = useContext(ResponseContext);
  if (context === undefined) {
    throw new Error("useResponses must be used within a ResponseProvider");
  }
  return context;
}
