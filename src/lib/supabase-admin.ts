import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || "";

// Cliente Supabase com service role key para operações administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
