import { supabase } from "../supabase";
import type { Database } from "../database.types";

export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
export type NewCampaign = Database["public"]["Tables"]["campaigns"]["Insert"];

export async function createCampaign(campaign: NewCampaign) {
  const { data, error } = await supabase
    .from("campaigns")
    .insert(campaign)
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
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCampaign(id: string) {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
