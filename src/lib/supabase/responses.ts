import { supabase } from "../supabase";
import { TokenUsage } from "../openai";

export interface AIResponse {
  id: string;
  content: string;
  status: "pending" | "generated" | "approved";
  usage: TokenUsage;
}

export async function saveAIResponse({
  campaignId,
  responseIndex,
  content,
  status,
  usage,
}: {
  campaignId: string;
  responseIndex: number;
  content: string;
  status: string;
  usage: TokenUsage;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to save responses");

  const { data, error } = await supabase
    .from("ai_responses")
    .upsert({
      user_id: user.id,
      campaign_id: campaignId,
      response_index: responseIndex,
      content,
      status,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.total_tokens,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAIResponses(campaignId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to get responses");

  const { data, error } = await supabase
    .from("ai_responses")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("user_id", user.id);

  if (error) throw error;

  // Convert to Record<string, AIResponse> format
  const responses: Record<string, AIResponse> = {};
  data.forEach((response) => {
    responses[response.response_index] = {
      id: response.id,
      content: response.content,
      status: response.status,
      usage: {
        prompt_tokens: response.prompt_tokens,
        completion_tokens: response.completion_tokens,
        total_tokens: response.total_tokens,
      },
    };
  });

  return responses;
}
