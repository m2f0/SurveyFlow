import { supabase } from "../supabase";
import type { Database } from "../database.types";

export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type NewCampaign = Database["public"]["Tables"]["campaigns"]["Insert"];

export async function createCampaign(campaign: NewCampaign) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User must be logged in to create a campaign");

  const { data, error } = await supabase
    .from("campaigns")
    .insert({ ...campaign, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCampaign(id: string, updates: Partial<Campaign>) {
  const { data, error } = await supabase
    .from("campaigns")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from("campaigns").delete().eq("id", id);

  if (error) throw error;
}

export async function getCampaigns() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User must be logged in to get campaigns");

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCampaign(id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User must be logged in to get campaign");

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data;
}
