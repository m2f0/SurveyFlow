import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Save, Plus, Trash2, Settings, Edit } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";

import {
  Campaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaigns,
} from "@/lib/supabase/campaigns";

type CampaignWithoutDates = Omit<Campaign, "created_at" | "scheduled_date"> & {
  scheduled_date?: Date | null;
  signature?: string;
  response_size?: "small" | "medium" | "large";
};

interface CampaignManagerProps {
  onCampaignSelect?: (campaign: Campaign | null) => void;
}

const defaultCampaigns: CampaignWithoutDates[] = [];

export default function CampaignManager({
  onCampaignSelect = () => {},
}: CampaignManagerProps) {
  const [campaigns, setCampaigns] =
    React.useState<CampaignWithoutDates[]>(defaultCampaigns);
  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignWithoutDates | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    id: "",
    name: "",
    status: "draft" as const,
    signature: "",
    response_size: "medium" as const,
  });

  React.useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error("Error loading campaigns:", error);
      }
    };

    loadCampaigns();
  }, []);

  const handleNewCampaign = () => {
    setEditMode(true);
    setSelectedCampaign(null);
    onCampaignSelect(null);
    setNewCampaign({
      id: "",
      name: "",
      status: "draft",
      signature: "",
      response_size: "medium",
    });
  };

  const handleEditCampaign = (campaign: CampaignWithoutDates) => {
    setEditMode(true);
    setNewCampaign({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      signature: campaign.signature || "",
      response_size: campaign.response_size || "medium",
    });
  };

  const handleSaveCampaign = async () => {
    try {
      let campaign;
      if (newCampaign.id) {
        // Update existing campaign
        campaign = await updateCampaign(newCampaign.id, {
          name: newCampaign.name,
          signature: newCampaign.signature,
          response_size: newCampaign.response_size,
        });
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? campaign : c)),
        );
      } else {
        // Create new campaign
        campaign = await createCampaign({
          name: newCampaign.name,
          status: "draft",
          signature: newCampaign.signature,
          response_size: newCampaign.response_size,
        });
        setCampaigns((prev) => [campaign, ...prev]);
      }

      setEditMode(false);
      setNewCampaign({
        id: "",
        name: "",
        status: "draft",
        signature: "",
        response_size: "medium",
      });
      setSelectedCampaign(campaign);
      onCampaignSelect(campaign);
    } catch (error) {
      console.error("Error saving campaign:", error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteCampaign(id);
      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
      setSelectedCampaign(null);
      onCampaignSelect(null);
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Email Campaign Manager</h1>
          <Button onClick={handleNewCampaign}>
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Campaign List */}
          <Card className="p-4 col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Campaigns</h2>
              <div className="text-sm text-muted-foreground">
                Select for AI responses
              </div>
            </div>
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer hover:bg-accent",
                    selectedCampaign?.id === campaign.id ? "bg-accent" : "",
                  )}
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setEditMode(false);
                    onCampaignSelect(campaign);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{campaign.name}</h3>
                    <Checkbox
                      checked={selectedCampaign?.id === campaign.id}
                      onCheckedChange={() => {
                        if (selectedCampaign?.id === campaign.id) {
                          setSelectedCampaign(null);
                          onCampaignSelect(null);
                        } else {
                          setSelectedCampaign(campaign);
                          onCampaignSelect(campaign);
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Campaign Editor */}
          <Card className="p-4 col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? "Create Campaign" : "Campaign Details"}
            </h2>
            {selectedCampaign || editMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input
                    value={editMode ? newCampaign.name : selectedCampaign?.name}
                    onChange={(e) =>
                      editMode &&
                      setNewCampaign((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    disabled={!editMode}
                  />
                </div>

                {/* AI Configuration Section */}
                <Card className="p-4 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      <h3 className="text-lg font-semibold">
                        AI Configuration
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Email Signature
                        </label>
                        <Textarea
                          placeholder="Enter your email signature..."
                          value={
                            editMode
                              ? newCampaign.signature
                              : selectedCampaign?.signature
                          }
                          onChange={(e) =>
                            editMode &&
                            setNewCampaign((prev) => ({
                              ...prev,
                              signature: e.target.value,
                            }))
                          }
                          disabled={!editMode}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Response Size
                        </label>
                        <RadioGroup
                          value={
                            editMode
                              ? newCampaign.response_size
                              : selectedCampaign?.response_size
                          }
                          onValueChange={(value) =>
                            editMode &&
                            setNewCampaign((prev) => ({
                              ...prev,
                              response_size: value as
                                | "small"
                                | "medium"
                                | "large",
                            }))
                          }
                          disabled={!editMode}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="small" id="small" />
                            <Label htmlFor="small">Small</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium">Medium</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="large" id="large" />
                            <Label htmlFor="large">Large</Label>
                          </div>
                        </RadioGroup>
                        <p className="text-sm text-muted-foreground mt-1">
                          {editMode ? (
                            <>
                              {newCampaign.response_size === "small" &&
                                "Brief response with a few words"}
                              {newCampaign.response_size === "medium" &&
                                "Standard response with a paragraph"}
                              {newCampaign.response_size === "large" &&
                                "Detailed response with multiple paragraphs"}
                            </>
                          ) : (
                            <>
                              {selectedCampaign?.response_size === "small" &&
                                "Brief response with a few words"}
                              {selectedCampaign?.response_size === "medium" &&
                                "Standard response with a paragraph"}
                              {selectedCampaign?.response_size === "large" &&
                                "Detailed response with multiple paragraphs"}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6">
                  {editMode ? (
                    <Button onClick={handleSaveCampaign} className="w-32">
                      <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                  ) : (
                    selectedCampaign && (
                      <div className="space-x-4">
                        <Button
                          variant="outline"
                          onClick={() => handleEditCampaign(selectedCampaign)}
                          className="w-32"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleDeleteCampaign(selectedCampaign.id)
                          }
                          className="w-32"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a campaign or create a new one to get started
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
