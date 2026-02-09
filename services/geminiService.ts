
import { GoogleGenAI } from "@google/genai";
import { EnergyRecord } from "../types.ts";

/**
 * Generates energy efficiency insights using Google Gemini AI.
 * Adheres to strict initialization rules: creating a new instance right before the call.
 */
export const getEnergyInsights = async (data: EnergyRecord[], language: string = 'en'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = data.reduce((acc, curr) => {
    acc.totalUsage += curr.usageKWh;
    acc.totalCost += curr.cost;
    acc.sources[curr.source] = (acc.sources[curr.source] || 0) + curr.usageKWh;
    return acc;
  }, { totalUsage: 0, totalCost: 0, sources: {} as Record<string, number> });

  const prompts: Record<string, string> = {
    en: "Provide 3 concise, actionable bullet points for cost saving and efficiency based on this data. High-end corporate tone.",
    pt: "Forneça 3 pontos objetivos e acionáveis para economia de custos e eficiência baseados nestes dados. Tom corporativo sofisticado.",
    es: "Proporcione 3 puntos concisos y prácticos para el ahorro de costos y la eficiencia basados en estos datos. Tono corporativo de alto nivel."
  };

  const currency = language === 'pt' ? 'R$' : '$';
  const prompt = `
    Analyze this energy data (30 days):
    Usage: ${summary.totalUsage.toFixed(2)} kWh
    Cost: ${currency}${summary.totalCost.toFixed(2)}
    Sources: ${JSON.stringify(summary.sources)}
    
    Instruction: ${prompts[language] || prompts.en}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || (language === 'pt' ? "Sem insights disponíveis." : "No insights available.");
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    const errorMsgs: Record<string, string> = {
      pt: "Não foi possível gerar insights no momento.",
      es: "No se pudo generar información en este momento.",
      en: "Unable to generate insights at this time."
    };
    return errorMsgs[language] || errorMsgs.en;
  }
};
