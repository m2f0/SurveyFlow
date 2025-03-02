import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Singleton pattern to ensure only one instance is created
let supabaseAdminInstance: SupabaseClient | null = null;

function createSupabaseAdminClient(): SupabaseClient {
  if (supabaseAdminInstance) return supabaseAdminInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || "";

  supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseAdminInstance;
}

// Cliente Supabase com service role key para operações administrativas
export const supabaseAdmin = createSupabaseAdminClient();
