import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CSVData {
  [key: string]: string;
}

interface CSVUploaderProps {
  onDataParsed?: (data: CSVData[], fileInfo: FileInfo) => void;
  maxSize?: number;
  initialFileInfo?: FileInfo | null;
}

interface FileInfo {
  name: string;
  size: number;
  date: string;
  recordCount: number;
}

async function updateUserCredits(userId: string, creditsToReduce: number) {
  // First get current credits
  const { data: userData, error: fetchError } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (fetchError) throw fetchError;
  if (!userData) throw new Error("User not found");

  // Then update with new value
  const newCredits = userData.credits - creditsToReduce;
  const { data, error } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId)
    .select("credits")
    .single();

  if (error) throw error;
  return data?.credits;
}

const CSVUploader = ({
  onDataParsed = () => {},
  maxSize = 5,
  initialFileInfo = null,
}: CSVUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(
    initialFileInfo,
  );
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const parseCSV = async (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const headers = lines[0].split(",").map((header) => header.trim());
    const data: CSVData[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",").map((value) => value.trim());
      const entry: CSVData = {};

      headers.forEach((header, index) => {
        entry[header] = values[index] || "";
      });

      data.push(entry);

      // Update progress based on current line
      const progress = Math.min(90, (i / lines.length) * 100);
      setUploadProgress(progress);
    }

    return data;
  };

  const processFile = async (file: File) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to upload files",
      });
      return;
    }

    // Check if user has enough credits
    const { data: userData, error: creditsError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (creditsError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not check credits balance",
      });
      return;
    }

    // Count lines in file to check credits
    const text = await file.text();
    // Split by newline and filter out empty lines
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    // Subtract 1 for header row
    const requiredCredits = Math.max(0, lines.length - 1);

    if (userData.credits < requiredCredits) {
      toast({
        variant: "destructive",
        title: "Insufficient credits",
        description: `You need ${requiredCredits} credits but only have ${userData.credits}`,
      });
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV file",
      });
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `File size should be less than ${maxSize}MB`,
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // File already read above for credit check
      const data = await parseCSV(text);

      // Complete the progress
      setUploadProgress(100);

      // Update user credits
      try {
        // Don't deduct credits here - they will be deducted per response generation
        const { data: userData } = await supabase
          .from("users")
          .select("credits")
          .eq("id", user.id)
          .single();

        const remainingCredits = userData?.credits || 0;

        // Create file info object
        const fileInfo = {
          name: file.name,
          size: file.size,
          date: new Date().toLocaleString(),
          recordCount: data.length,
        };

        // Save file information
        setUploadedFile(fileInfo);

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          onDataParsed(data, fileInfo);

          toast({
            title: "Success",
            description: `Successfully processed ${data.length} records. Remaining credits: ${remainingCredits}`,
          });
        }, 500);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error updating credits",
          description: error.message,
        });
      }
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process CSV file",
      });
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleClearFile = () => {
    setUploadedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Card className="w-full max-w-3xl mx-auto p-6 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">CSV File Upload</h2>
        {uploadedFile && (
          <Badge variant="outline" className="px-3 py-1">
            <FileText className="w-4 h-4 mr-2" />
            File Available
          </Badge>
        )}
      </div>

      {uploadedFile ? (
        <div className="mb-6">
          <Card className="p-4 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-primary mr-3" />
                <div>
                  <h3 className="font-medium text-lg">{uploadedFile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {uploadedFile.date}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClearFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Separator className="my-3" />

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm font-medium">File Size</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Records</p>
                <p className="text-sm text-muted-foreground">
                  {uploadedFile.recordCount} entries
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </Card>

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Upload Another File
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`relative h-64 border-2 border-dashed rounded-lg transition-colors ${isDragging ? "border-primary bg-secondary/20" : "border-border"} ${isUploading ? "opacity-50" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInput}
            id="file-upload"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <Upload className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">
                Drag and drop your CSV file here
              </p>
              <p className="text-sm text-muted-foreground">or</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={isUploading}
              >
                Browse Files
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Maximum file size: {maxSize}MB
            </p>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Processing file...</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(uploadProgress)}%
            </span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </Card>
  );
};

export default CSVUploader;
