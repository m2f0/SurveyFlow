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

const getCampaignThemeInstructions = (theme?: string) => {
  switch (theme) {
    case "thanks":
      return "Express sincere gratitude for their feedback and time. Emphasize how valuable their input is.";
    case "birthday":
      return "Include warm birthday wishes while addressing their feedback. Keep the tone celebratory but professional.";
    case "anniversary":
      return "Acknowledge their work anniversary milestone while addressing feedback. Express appreciation for their long-term relationship.";
    case "welcome":
      return "Welcome them warmly to the organization/service while addressing their initial feedback. Show enthusiasm for the new relationship.";
    case "promotion":
      return "Congratulate them on their promotion while addressing feedback. Express confidence in their future success.";
    case "christmas":
      return "Include seasonal Christmas wishes while addressing feedback. Keep the tone festive but professional.";
    case "new_year":
      return "Include New Year wishes and positive future outlook while addressing feedback.";
    case "thanksgiving":
      return "Express gratitude and thanksgiving wishes while addressing feedback.";
    case "easter":
      return "Include Easter wishes while addressing feedback. Keep the tone spring-themed and hopeful.";
    case "halloween":
      return "Include fun Halloween wishes while maintaining professionalism in feedback response.";
    case "valentines":
      return "Include warm Valentine's Day wishes while maintaining professional tone in feedback response.";
    case "mothers_day":
      return "Include thoughtful Mother's Day wishes while addressing feedback.";
    case "fathers_day":
      return "Include thoughtful Father's Day wishes while addressing feedback.";
    case "graduation":
      return "Offer warm graduation congratulations while addressing feedback. Express excitement for their achievement.";
    case "retirement":
      return "Include heartfelt retirement wishes while addressing feedback. Acknowledge their career contributions.";
    case "get_well":
      return "Express genuine get-well wishes while addressing feedback. Show care and concern.";
    case "condolences":
      return "Express sincere condolences while sensitively addressing feedback. Maintain an especially respectful tone.";
    case "baby":
      return "Include warm congratulations on their new baby while addressing feedback.";
    case "wedding":
      return "Include heartfelt wedding congratulations while addressing feedback.";
    default:
      return "Maintain a professional and friendly tone while focusing on their specific feedback.";
  }
};

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

    const getThemeStartingPhrase = (theme?: string) => {
      switch (theme) {
        case "christmas":
          return "Start with 'Merry Christmas!' and include festive wishes";
        case "new_year":
          return "Start with 'Happy New Year!' and include wishes for the year ahead";
        case "birthday":
          return "Start with 'Happy Birthday!' and include warm wishes";
        case "anniversary":
          return "Start with work anniversary congratulations";
        case "thanksgiving":
          return "Start with Thanksgiving wishes";
        case "easter":
          return "Start with 'Happy Easter!' and spring wishes";
        case "halloween":
          return "Start with 'Happy Halloween!' and festive wishes";
        case "valentines":
          return "Start with Valentine's Day wishes";
        default:
          return `Start with ${theme || "appropriate"} themed wishes`;
      }
    };

    console.log("Generating AI response with campaign type:", campaignType);
    const prompt = `You are writing ONLY the main content of an email response to a customer who completed our survey. ${sizeInstructions[responseSize || "medium"]}

IMPORTANT REQUIREMENTS:
1. Do NOT include ANY of these elements:
   - No subject lines
   - No email headers
   - No greetings (like "Dear" or "Hello")
   - No signatures
   - No titles or roles

2. MANDATORY: Your response MUST include TWO parts in this order:
   a. ${getThemeStartingPhrase(campaignType)}
   b. Then address their survey feedback

Campaign Theme: ${campaignType || "general"}
Theme Instructions:
${getCampaignThemeInstructions(campaignType)}

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
