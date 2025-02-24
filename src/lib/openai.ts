import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AIResponseResult {
  content: string;
  usage: TokenUsage;
}

export async function generateAIResponse(
  surveyData: Record<string, string>,
  companyName?: string,
  companyDetails?: string,
  signature?: string,
  responseSize?: "small" | "medium" | "large",
  campaignType?: string,
): Promise<AIResponseResult> {
  try {
    const sizeInstructions = {
      small: "Write a brief, friendly email response in 2-3 sentences",
      medium: "Write a detailed email response in 1-2 short paragraphs",
      large: "Write a comprehensive email response in 2-3 paragraphs",
    };

    const prompt = `You are writing ONLY the main content of an email response to a customer who completed our survey. ${sizeInstructions[responseSize || "medium"]}

IMPORTANT: Do NOT include ANY of these elements:
- No subject lines
- No email headers
- No greetings (like "Dear" or "Hello")
- No signatures
- No titles or roles

Write a response that combines:
1. Addressing their survey feedback specifically
2. Adding appropriate ${campaignType || "general"} wishes/message

Their survey responses:\n${Object.entries(surveyData)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n")}

${companyDetails ? `Important - Include these company details naturally in the response:\n${companyDetails}\n\n` : ""}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at writing the main content of customer email responses. Write in a warm, professional tone that makes each customer feel valued and heard. STRICTLY FORBIDDEN: Do not include subject lines, email headers, greetings, signatures, or any other email formatting - write only the main message content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens:
        responseSize === "small" ? 100 : responseSize === "medium" ? 300 : 500,
    });

    const content =
      response.choices[0]?.message?.content || "Unable to generate response";

    const finalContent = `${content}\n\n${signature || `Warm regards,\n${companyName || "[Your Company Name]"}}`}`;

    return {
      content: finalContent,
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error("Error generating AI response:", error);
    return {
      content: "Error generating AI response. Please try again.",
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }
}
