
import { GoogleGenAI } from "@google/genai";
import { EnergyRecord } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getEnergyInsights = async (data: EnergyRecord[]) => {
  if (!API_KEY) return "AI Insights unavailable. Please provide an API key.";

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Aggregate data for a concise prompt
  const summary = data.reduce((acc, curr) => {
    acc.totalUsage += curr.usageKWh;
    acc.totalCost += curr.cost;
    acc.sources[curr.source] = (acc.sources[curr.source] || 0) + curr.usageKWh;
    return acc;
  }, { totalUsage: 0, totalCost: 0, sources: {} as any });

  const prompt = `
    Analyze this energy consumption data for the past 30 days:
    Total Usage: ${summary.totalUsage.toFixed(2)} kWh
    Total Cost: $${summary.totalCost.toFixed(2)}
    Breakdown by source: ${JSON.stringify(summary.sources)}
    
    Provide 3 concise, actionable bullet points for cost saving and efficiency, following a professional yet encouraging tone suitable for a high-end consumer app.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate insights at this time.";
  }
};
