
import { GoogleGenAI, Type } from "@google/genai";
import { EnergyRecord } from "../types.ts";

/**
 * Generates structured energy efficiency insights using Google Gemini AI.
 * Specialized in the Brazilian Free Energy Market (ACL) and ANEEL RN 1,000/2021.
 */
export const getEnergyInsights = async (data: EnergyRecord[], language: string = 'pt'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const summary = data.reduce((acc, curr) => {
    acc.totalUsage += curr.usageKWh;
    acc.totalCost += curr.cost;
    acc.sources[curr.source] = (acc.sources[curr.source] || 0) + curr.usageKWh;
    return acc;
  }, { totalUsage: 0, totalCost: 0, sources: {} as Record<string, number> });

  // Specialized context for the Brazilian Market
  const contextPrompts: Record<string, string> = {
    pt: `Você é um consultor especialista no Mercado Livre de Energia (ACL) do Brasil e na RESOLUÇÃO NORMATIVA ANEEL Nº 1.000, DE 7 DE DEZEMBRO DE 2021. 
    Sua tarefa é analisar os dados de consumo fornecidos e gerar 3 insights estratégicos baseados estritamente nas normas brasileiras para reduzir custos. 
    Foque em:
    1. Otimização de Demanda Contratada e ultrapassagens (Art. 289 da RN 1000).
    2. Correção de Fator de Potência e cobrança de Energia Reativa Excedente (Art. 293 a 301).
    3. Viabilidade de Migração para o ACL (Mercado Livre) ou migração para Tarifação Binômia (Verde/Azul).
    4. Gestão de custos de TUSD e TE conforme a resolução.
    Use um tom executivo, técnico e direto. Cite artigos da resolução quando relevante.`,
    
    en: `You are an expert consultant in the Brazilian Free Energy Market (ACL) and ANEEL Normative Resolution No. 1,000/2021.
    Analyze the provided energy data and generate 3 strategic insights to reduce costs based on Brazilian regulations.
    Focus on:
    1. Demand optimization and overshooting charges (Art. 289).
    2. Reactive Energy penalties and Power Factor correction (Art. 293-301).
    3. Feasibility of ACL migration or Tariff Modality adjustment (Green/Blue).
    Use a technical, corporate tone.`,
    
    es: `Usted es un consultor experto en el Mercado Libre de Energía de Brasil (ACL) y en la Resolución Normativa ANEEL N° 1.000/2021.
    Analice los datos de energía y genere 3 recomendaciones estratégicas para reducir costos basadas en la regulación brasileña.
    Enfoque en: optimización de demanda, multas por energía reactiva y viabilidad de migración al mercado libre.`
  };

  const currency = language === 'pt' ? 'R$' : '$';
  const prompt = `
    DADOS DO CLIENTE (Últimos 30 dias):
    Consumo Total: ${summary.totalUsage.toFixed(2)} kWh
    Custo Total: ${currency}${summary.totalCost.toFixed(2)}
    Mix de Fontes: ${JSON.stringify(summary.sources)}
    
    INSTRUÇÃO: ${contextPrompts[language] || contextPrompts.pt}
    Gere exatamente 3 insights no formato JSON solicitado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { 
                    type: Type.STRING, 
                    description: "Título curto e impactante mencionando a oportunidade regulatória." 
                  },
                  description: { 
                    type: Type.STRING, 
                    description: "Explicação técnica citando a RN 1000/2021 e o impacto financeiro estimado nos dados." 
                  },
                  action: { 
                    type: Type.STRING, 
                    description: "Passo a passo prático para implementar a economia (ex: alteração de contrato, instalação de banco de capacitores)." 
                  }
                },
                required: ["title", "description", "action"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Regulatory Analysis Error:", error);
    return "";
  }
};
