import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateMetrics = async (capabilityName: string, domain: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 8 business metrics for a capability named "${capabilityName}" in the "${domain}" domain. 
    Include 5 KPIs and 3 Advanced Metrics. 
    Return ONLY a JSON array of objects with "name", "value", "unit", and "trend" (up/down/stable).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            value: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            trend: { type: Type.STRING }
          },
          required: ["name", "value", "unit", "trend"]
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateVisualization = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [{ text: `Create a professional business architecture diagram for: ${prompt}. Style: Clean, enterprise, blueprint.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
