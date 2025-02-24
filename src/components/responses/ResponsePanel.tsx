import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, Edit2, Save, ThumbsUp, Loader2 } from "lucide-react";
import { generateAIResponse, TokenUsage } from "@/lib/openai";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateUserCredits } from "@/lib/supabase/users";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useResponses } from "@/lib/context/ResponseContext";

interface CSVData {
  [key: string]: string;
}

interface ResponsePanelProps {
  responses?: CSVData[];
  onApprove?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
  companyName?: string;
  companyDetails?: string;
  signature?: string;
  responseSize?: "small" | "medium" | "large";
  campaignType?: string;
  campaignId?: string;
}

interface AIResponse {
  id: string;
  content: string;
  status: "pending" | "generated" | "approved";
  usage: TokenUsage;
}

interface SelectedResponses {
  [key: number]: boolean;
}

const ResponsePanel = ({
  responses = [],
  onApprove = () => {},
  onEdit = () => {},
  companyName = "",
  companyDetails = "",
  signature = "",
  responseSize = "medium",
  campaignType = "general",
  campaignId = "",
}: ResponsePanelProps) => {
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editContent, setEditContent] = useState<Record<string, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, AIResponse>>(
    {},
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selectedResponses, setSelectedResponses] = useState<SelectedResponses>(
    {},
  );
  const { toast } = useToast();
  const { user } = useAuth();
  const { getResponsesForCampaign, setResponsesForCampaign } = useResponses();

  // Load responses from context when campaignId changes
  React.useEffect(() => {
    if (campaignId) {
      const savedResponses = getResponsesForCampaign(campaignId);
      setAiResponses(savedResponses);
    }
  }, [campaignId, getResponsesForCampaign]);

  const generateResponseForIndex = async (index: number, response: CSVData) => {
    setLoading((prev) => ({ ...prev, [index]: true }));
    try {
      const result = await generateAIResponse(
        response,
        companyName,
        companyDetails,
        signature,
        responseSize,
        campaignType,
      );

      // Check credits and deduct tokens
      try {
        const { data: userData, error: creditsError } = await supabase
          .from("users")
          .select("credits")
          .eq("id", user?.id)
          .single();

        if (creditsError) throw creditsError;

        const estimatedTokens = 1000;

        if (!userData || userData.credits < estimatedTokens) {
          throw new Error(
            `Insufficient credits. You need at least ${estimatedTokens} credits to generate a response.`,
          );
        }

        await updateUserCredits(user?.id!, result.usage.total_tokens);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to update credits",
        });
        return;
      }

      const newResponse = {
        id: String(index),
        content: result.content,
        status: "generated",
        usage: result.usage,
      };

      setAiResponses((prev) => {
        const newResponses = {
          ...prev,
          [index]: newResponse,
        };
        // Update context if we have a campaignId
        if (campaignId) {
          setResponsesForCampaign(campaignId, newResponses);
        }
        return newResponses;
      });
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to generate AI response for item ${index + 1}`,
      });
    } finally {
      setLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleGenerateSelectedResponses = async () => {
    const selectedIndexes = Object.entries(selectedResponses)
      .filter(([_, isSelected]) => isSelected)
      .map(([index]) => parseInt(index));

    if (selectedIndexes.length === 0) {
      toast({
        variant: "destructive",
        title: "No responses selected",
        description: "Please select at least one response to generate.",
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to generate responses",
      });
      return;
    }

    const estimatedTokensPerResponse = 1000;
    const totalTokensNeeded =
      selectedIndexes.length * estimatedTokensPerResponse;

    try {
      const { data: userData, error: creditsError } = await supabase
        .from("users")
        .select("credits")
        .eq("id", user.id)
        .single();

      if (creditsError) throw creditsError;

      if (!userData || userData.credits < totalTokensNeeded) {
        toast({
          variant: "destructive",
          title: "Insufficient credits",
          description: `You need at least ${totalTokensNeeded} credits to generate ${selectedIndexes.length} responses.`,
        });
        return;
      }

      for (const index of selectedIndexes) {
        if (!aiResponses[index]?.content) {
          await generateResponseForIndex(index, responses[index]);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      setSelectedResponses({});
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate responses",
      });
    }
  };

  const handleEditStart = (id: string, content: string) => {
    setEditMode((prev) => ({ ...prev, [id]: true }));
    setEditContent((prev) => ({ ...prev, [id]: content }));
  };

  const handleEditSave = (id: string) => {
    onEdit(id, editContent[id]);
    setEditMode((prev) => ({ ...prev, [id]: false }));
  };

  const handleSelectAll = () => {
    const newSelections: SelectedResponses = {};
    responses.forEach((_, index) => {
      if (!aiResponses[index]?.content) {
        newSelections[index] = true;
      }
    });
    setSelectedResponses(newSelections);
  };

  return (
    <div className="w-full h-full min-h-[600px] bg-background p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Response Management</h2>
        {responses.length > 0 && (
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSelectAll}
              variant="outline"
              className="flex items-center gap-2"
              disabled={responses.every(
                (_, index) => !!aiResponses[index]?.content,
              )}
            >
              Select All
            </Button>
            <div className="text-sm text-muted-foreground">
              {Object.values(selectedResponses).filter(Boolean).length} selected
            </div>
            <Button
              onClick={handleGenerateSelectedResponses}
              variant="default"
              className="flex items-center gap-2"
              disabled={
                Object.values(selectedResponses).filter(Boolean).length === 0
              }
            >
              <Loader2
                className={cn(
                  "h-4 w-4",
                  Object.values(loading).some((l) => l)
                    ? "animate-spin"
                    : "hidden",
                )}
              />
              Generate Selected Responses
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {responses.map((response, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Response #{index + 1}
                </div>
                <Checkbox
                  checked={selectedResponses[index] || false}
                  onCheckedChange={(checked) => {
                    setSelectedResponses((prev) => ({
                      ...prev,
                      [index]: checked === true,
                    }));
                  }}
                  disabled={!!aiResponses[index]?.content}
                />
              </div>
              <Tabs defaultValue="original" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="original">Original Response</TabsTrigger>
                  <TabsTrigger value="ai">AI Response</TabsTrigger>
                </TabsList>

                <TabsContent value="original" className="mt-0">
                  <div className="bg-muted p-4 rounded-md space-y-2">
                    {Object.entries(response).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="font-medium text-sm text-muted-foreground">
                          {key}:
                        </span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="mt-0">
                  <div className="space-y-4">
                    {editMode[index] ? (
                      <>
                        <Textarea
                          value={editContent[index]}
                          onChange={(e) =>
                            setEditContent((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }))
                          }
                          className="min-h-[100px]"
                        />
                        <Button
                          onClick={() => handleEditSave(String(index))}
                          className="mr-2"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <div className="bg-muted p-4 rounded-md">
                        {loading[index] ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="ml-2">
                              Generating AI response...
                            </span>
                          </div>
                        ) : aiResponses[index]?.content ? (
                          <div className="whitespace-pre-wrap">
                            {aiResponses[index].content}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4 space-y-4">
                            <p className="text-muted-foreground">
                              No AI response generated yet
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 mt-4">
                      {!editMode[index] && aiResponses[index]?.content && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleEditStart(
                                String(index),
                                aiResponses[index].content,
                              )
                            }
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Response
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => onApprove(String(index))}
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span className="text-sm text-muted-foreground">
                    Status:{" "}
                    {loading[index]
                      ? "Generating..."
                      : aiResponses[index]?.status || "Pending"}
                  </span>
                </div>
                {aiResponses[index]?.usage && (
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>
                      Input: {aiResponses[index].usage.prompt_tokens} tokens
                    </span>
                    <span>
                      Output: {aiResponses[index].usage.completion_tokens}{" "}
                      tokens
                    </span>
                    <span>
                      Total: {aiResponses[index].usage.total_tokens} tokens
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ResponsePanel;
