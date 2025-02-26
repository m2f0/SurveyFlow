import { supabase } from "../supabase";

export async function updateUserCredits(userId: string, tokensUsed: number) {
  // First get current credits
  const { data: userData, error: fetchError } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (fetchError) throw fetchError;
  if (!userData) throw new Error("User not found");

  // Then update with new value
  const newCredits = userData.credits - tokensUsed;

  if (newCredits < 0) {
    throw new Error("Insufficient credits");
  }

  const { data, error } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId)
    .select("credits")
    .single();

  if (error) throw error;
  return data?.credits;
}

export async function getUserCredits(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data?.credits;
}

export async function increaseUserCredits(
  userId: string,
  amount: number = 14500,
) {
  // First get current credits
  const { data: userData, error: fetchError } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (fetchError) throw fetchError;
  if (!userData) throw new Error("User not found");

  // Then update with new value
  const newCredits = (userData.credits || 0) + amount;

  const { data, error } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId)
    .select("credits")
    .single();

  if (error) throw error;
  return data?.credits;
}
