export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          scheduled_date: string | null;
          status: "draft" | "scheduled" | "sent";
          signature: string | null;
          response_size: "small" | "medium" | "large" | null;
          campaign_type: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          scheduled_date?: string | null;
          status?: "draft" | "scheduled" | "sent";
          signature?: string | null;
          response_size?: "small" | "medium" | "large" | null;
          campaign_type?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          scheduled_date?: string | null;
          status?: "draft" | "scheduled" | "sent";
          signature?: string | null;
          response_size?: "small" | "medium" | "large" | null;
          campaign_type?: string | null;
        };
      };
    };
  };
}
