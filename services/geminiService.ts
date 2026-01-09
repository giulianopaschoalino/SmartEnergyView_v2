
import { GoogleGenAI } from "@google/genai";
import { EnergyRecord } from "../types.ts";

export const getEnergyInsights = async (data: EnergyRecord[], language: string = 'en') => {
  // Always initialize right before use to ensure the most current environment variables are used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Aggregate data for a concise prompt
  const summary = data.reduce((acc, curr) => {
    acc.totalUsage += curr.usageKWh;
    acc.totalCost += curr.cost;
    acc.sources[curr.source] = (acc.sources[curr.source] || 0) + curr.usageKWh;
    return acc;
  }, { totalUsage: 0, totalCost: 0, sources: {} as any });

  const languageContexts: Record<string, string> = {
    en: "Please provide the response in English.",
    pt: "Por favor, forneça a resposta em Português do Brasil.",
    es: "Por favor, proporcione la respuesta en Español."
  };

  const currentContext = languageContexts[language] || languageContexts.en;

  const prompt = `
    Analyze this energy consumption data for the past 30 days:
    Total Usage: ${summary.totalUsage.toFixed(2)} kWh
    Total Cost: ${language === 'pt' ? 'R$' : '$'}${summary.totalCost.toFixed(2)}
    Breakdown by source: ${JSON.stringify(summary.sources)}
    
    ${currentContext}
    Provide 3 concise, actionable bullet points for cost saving and efficiency.
    Use a professional, high-end corporate tone.
    Ensure currency formatting matches the selected language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // FIX: Manually extract text parts to avoid the 'thoughtSignature' console warning
    // triggered by the response.text getter when reasoning parts are present.
    const text = response.candidates?.[0]?.content?.parts
      ?.filter(part => part.text)
      ?.map(part => part.text)
      ?.join('') || '';

    return text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'pt' ? "Não foi possível gerar insights no momento." : 
           language === 'es' ? "No se pudo generar información en este momento." : 
           "Unable to generate insights at this time.";
  }
};
