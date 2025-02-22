import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, Edit2, Save, ThumbsUp, Loader2 } from "lucide-react";
import { generateAIResponse } from "@/lib/openai";
import { useToast } from "@/components/ui/use-toast";

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
}

interface AIResponse {
  id: string;
  content: string;
  status: "pending" | "generated" | "approved";
}

const generateResponseForIndex = async (
  index: number,
  response: CSVData,
  setLoading: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  setAiResponses: React.Dispatch<
    React.SetStateAction<Record<string, AIResponse>>
  >,
  toast: any,
  companyName?: string,
  companyDetails?: string,
  signature?: string,
  responseSize?: "small" | "medium" | "large",
) => {
  setLoading((prev) => ({ ...prev, [index]: true }));
  try {
    const aiResponse = await generateAIResponse(
      response,
      companyName,
      companyDetails,
      signature,
      responseSize,
    );
    setAiResponses((prev) => ({
      ...prev,
      [index]: {
        id: String(index),
        content: aiResponse,
        status: "generated",
      },
    }));
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

const ResponsePanel = ({
  responses = [],
  onApprove = () => {},
  onEdit = () => {},
  companyName = "",
  companyDetails = "",
  signature = "",
  responseSize = "medium",
  campaignType = "general",
}: ResponsePanelProps) => {
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editContent, setEditContent] = useState<Record<string, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<string, AIResponse>>(
    {},
  );
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Effect to generate AI responses automatically
  useEffect(() => {
    const generateResponses = async () => {
      // Generate responses one by one with a small delay to avoid rate limiting
      for (let i = 0; i < responses.length; i++) {
        if (!aiResponses[i]) {
          await generateResponseForIndex(
            i,
            responses[i],
            setLoading,
            setAiResponses,
            toast,
            companyName,
            companyDetails,
            signature,
            responseSize,
            campaignType,
          );
          // Add a small delay between requests
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    };

    if (responses.length > 0) {
      generateResponses();
    }
  }, [responses.length, toast]);

  const handleEditStart = (id: string, content: string) => {
    setEditMode((prev) => ({ ...prev, [id]: true }));
    setEditContent((prev) => ({ ...prev, [id]: content }));
  };

  const handleEditSave = (id: string) => {
    onEdit(id, editContent[id]);
    setEditMode((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="w-full h-full min-h-[600px] bg-background p-6">
      <h2 className="text-2xl font-bold mb-6">Response Management</h2>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {responses.map((response, index) => (
            <Card key={index} className="p-6">
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
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="ml-2">
                              Waiting to generate response...
                            </span>
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
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ResponsePanel;
