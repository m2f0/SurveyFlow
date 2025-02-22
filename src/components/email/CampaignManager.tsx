import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Send, Save, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface CampaignManagerProps {
  templates?: Template[];
  onSaveTemplate?: (template: Template) => void;
  onScheduleCampaign?: (template: Template, date: Date) => void;
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Welcome Email",
    subject: "Welcome to Our Survey Platform",
    content: "Thank you for participating in our survey...",
  },
  {
    id: "2",
    name: "Follow-up Template",
    subject: "Your Survey Response Follow-up",
    content: "We appreciate your recent survey submission...",
  },
];

export default function CampaignManager({
  templates = defaultTemplates,
  onSaveTemplate = () => {},
  onScheduleCampaign = () => {},
}: CampaignManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [date, setDate] = useState<Date>();
  const [editMode, setEditMode] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    id: "",
    name: "",
    subject: "",
    content: "",
  });

  const handleNewTemplate = () => {
    setEditMode(true);
    setSelectedTemplate(null);
    setNewTemplate({
      id: Date.now().toString(),
      name: "",
      subject: "",
      content: "",
    });
  };

  const handleSaveTemplate = () => {
    onSaveTemplate(newTemplate);
    setEditMode(false);
    setNewTemplate({
      id: "",
      name: "",
      subject: "",
      content: "",
    });
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Email Campaign Manager</h1>
          <Button onClick={handleNewTemplate}>
            <Plus className="mr-2 h-4 w-4" /> New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Template List */}
          <Card className="p-4 col-span-1">
            <h2 className="text-xl font-semibold mb-4">Templates</h2>
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer hover:bg-accent",
                    selectedTemplate?.id === template.id ? "bg-accent" : "",
                  )}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setEditMode(false);
                  }}
                >
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {template.subject}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Template Editor */}
          <Card className="p-4 col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? "Create Template" : "Template Details"}
            </h2>
            {selectedTemplate || editMode ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name</label>
                  <Input
                    value={editMode ? newTemplate.name : selectedTemplate?.name}
                    onChange={(e) =>
                      editMode &&
                      setNewTemplate((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    disabled={!editMode}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Line</label>
                  <Input
                    value={
                      editMode ? newTemplate.subject : selectedTemplate?.subject
                    }
                    onChange={(e) =>
                      editMode &&
                      setNewTemplate((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    disabled={!editMode}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Content</label>
                  <Textarea
                    rows={8}
                    value={
                      editMode ? newTemplate.content : selectedTemplate?.content
                    }
                    onChange={(e) =>
                      editMode &&
                      setNewTemplate((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    disabled={!editMode}
                  />
                </div>
                <div className="flex justify-between">
                  {editMode ? (
                    <Button onClick={handleSaveTemplate}>
                      <Save className="mr-2 h-4 w-4" /> Save Template
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Schedule Campaign"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Button
                        onClick={() =>
                          selectedTemplate &&
                          date &&
                          onScheduleCampaign(selectedTemplate, date)
                        }
                        disabled={!date}
                      >
                        <Send className="mr-2 h-4 w-4" /> Send Campaign
                      </Button>
                    </div>
                  )}
                  {!editMode && (
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Template
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a template or create a new one to get started
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
