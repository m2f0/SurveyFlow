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
    const prompt = `You are an AI assistant helping to respond to a survey. Please provide a thoughtful and professional response based on the following survey data:\n\n${Object.entries(
      surveyData,
    )
      .map(([key, value]) => `${key}: ${value}`)
      .join(
        "\n",
      )}\n\nPlease generate a comprehensive response that addresses the key points in the survey.${companyDetails ? `\n\nInclude these company details in your response:\n${companyDetails}` : ""}\n\nEnd the response with:\n${signature || `Warm regards,\n${companyName || "[Your Company Name]"}`}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates professional and thoughtful responses to survey data.",
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

    return (
      response.choices[0]?.message?.content || "Unable to generate response"
    );
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Error generating AI response. Please try again.";
  }
}
