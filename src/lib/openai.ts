import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, you should use a backend service
});

export async function generateAIResponse(
  surveyData: Record<string, string>,
  companyName?: string,
  companyDetails?: string,
  signature?: string,
  responseSize?: "small" | "medium" | "large",
) {
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

Write ONLY the main message content that:
1. Thanks them for their feedback
2. Addresses their specific points and experiences
3. Shows we value their input
4. Maintains a positive and appreciative tone

Their survey responses:\n${Object.entries(surveyData)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n")}

${companyDetails ? `Important - Include these company details naturally in the response:\n${companyDetails}\n\n` : ""}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
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

    // Add signature separately
    return `${content}\n\n${signature || `Warm regards,\n${companyName || "[Your Company Name]"}`}`;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Error generating AI response. Please try again.";
  }
}
