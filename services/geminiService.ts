import { GoogleGenAI } from "@google/genai";
import { CVData } from "../types";

// Initialize the API client
// The key must be provided via process.env.API_KEY as per strict instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates the final HTML CV based on collected data.
 * Uses the thinking model as requested for complex tasks.
 */
export const generateCVHtml = async (data: CVData): Promise<string> => {
  const modelId = "gemini-3-pro-preview";
  
  const systemInstruction = `
    You are an expert Frontend Developer and Resume Designer.
    Your task is to convert the provided raw user data into a high-quality, professional, single-file HTML CV.
    
    GUIDELINES:
    1. Language: The CV content MUST be in Macedonian.
    2. Styling: Use embedded CSS (<style> tag) within the HTML. The design must be responsive and print-friendly.
    3. Structure: Semantic HTML5.
    4. Photo: Use the provided URL. If the user said 'SKIP' or provided invalid data, use 'https://via.placeholder.com/150'.
    5. Template Style: Adapt the design based on the user's chosen template style strictly.
    
    TEMPLATE STYLES:
    1. Modern Blue: Clean layout, sidebar for contacts, blue headers (#2563eb).
    2. Classic Minimalist: Black & white, serif fonts (Times New Roman/Georgia), very formal, no sidebar.
    3. Creative: Colorful accents (coral/teal), unique grid layout, modern sans-serif.
    4. Tech/Code: Dark mode appearance (or dark headers), monospace font (Courier/Fira Code), structured like code blocks.
    5. Executive: Elegant, centered header, lots of whitespace, sophisticated serif headings with sans-serif body.
  `;

  const userPrompt = `
    Create a CV for the following user:
    
    Target Role: ${data.targetRole}
    Contact Details: ${data.contactInfo}
    Experience: ${data.experience}
    Education: ${data.education}
    Skills: ${data.skills}
    Photo URL: ${data.photoUrl}
    
    Selected Template ID: ${data.templateChoice}
    
    Output ONLY the valid HTML code starting with <!DOCTYPE html>. Do not add markdown backticks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        // Enabling thinking mode as requested for the complex generation task
        thinkingConfig: {
          thinkingBudget: 32768, 
        },
      },
    });

    return response.text || "Се појави грешка при генерирањето. Ве молиме обидете се повторно.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Неуспешно поврзување со AI сервисот.");
  }
};