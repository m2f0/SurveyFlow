import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface CSVData {
  [key: string]: string;
}

interface CSVUploaderProps {
  onDataParsed?: (data: CSVData[]) => void;
  maxSize?: number;
}

const CSVUploader = ({
  onDataParsed = () => {},
  maxSize = 5,
}: CSVUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const parseCSV = async (text: string) => {
    const lines = text.split("\n");
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

      const text = await file.text();
      const data = await parseCSV(text);

      // Complete the progress
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        onDataParsed(data);

        toast({
          title: "Success",
          description: `Successfully processed ${data.length} records`,
        });
      }, 500);
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

  return (
    <Card className="w-full max-w-3xl mx-auto p-6 bg-background">
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
