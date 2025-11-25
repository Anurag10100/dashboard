import { GoogleGenAI, Type } from "@google/genai";
import { Project, Sponsor, DelegateLog, MarketingData } from "../types";

// Initialize Gemini
// Note: process.env.API_KEY is handled by the bundler/environment
const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateDashboardInsight = async (
  projects: Project[],
  sponsors: Sponsor[],
  delegates: DelegateLog[]
) => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");

  // Prepare a minimized context to save tokens, although 2.5 flash has a huge window.
  const contextData = {
    projectSummary: projects.map(p => ({
      name: p.project_name,
      status: p.status,
      revenueGap: p.revenue_target - p.revenue_actual,
      speakerFill: Math.round((p.speaker_actual / p.speaker_target) * 100) + '%'
    })),
    totalPipelineValue: sponsors.reduce((acc, s) => acc + s.value, 0),
    recentDelegateActivity: delegates.length
  };

  const prompt = `
    You are a Data Analyst for an Events Management company. 
    Analyze the following dashboard data snapshot and provide a JSON response.
    
    Data Context: ${JSON.stringify(contextData)}

    Provide:
    1. A one-sentence summary of the current health.
    2. The biggest risk identified (e.g., low speaker fill or revenue gap).
    3. A specific strategic recommendation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risk: { type: Type.STRING },
            recommendation: { type: Type.STRING },
          },
          required: ["summary", "risk", "recommendation"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Insight Error:", error);
    throw error;
  }
};

export const generateProjectDeepDive = async (
  project: Project,
  sponsors: Sponsor[],
  delegates: DelegateLog[],
  marketingData?: MarketingData
) => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key missing");

  const contextData = {
    project: project,
    sponsors: sponsors.map(s => ({ name: s.sponsor_name, stage: s.stage, value: s.value })),
    delegateCount: delegates.reduce((sum, d) => sum + d.count, 0),
    marketing: marketingData ? {
      emailOpenRate: marketingData.email_open_rate,
      adSpend: marketingData.ad_spend,
      socialReach: marketingData.social_impressions,
      recentCampaigns: marketingData.recent_campaigns.map(c => c.name + " (" + c.metric + ")")
    } : "No marketing data available",
    daysUntilEvent: Math.ceil((new Date(project.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  };

  const prompt = `
    You are a Senior Project Manager & Marketing Strategist. Analyze this specific event project.
    Consider the finances, speakers, AND marketing performance (email opens, ad spend, social reach) to provide a comprehensive status report in JSON format.
    
    Data: ${JSON.stringify(contextData)}

    Requirements:
    1. "statusAssessment": A professional assessment of the project status (Critical/On Track). If marketing is weak, mention it.
    2. "actionPlan": A bulleted list (array of strings) of 3 immediate actions to take. Mix operational and marketing actions.
    3. "emailDraft": A professional email draft to the stakeholders updating them on progress, highlighting wins (like signed sponsors) and flagging needs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            statusAssessment: { type: Type.STRING },
            actionPlan: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            emailDraft: { type: Type.STRING },
          },
          required: ["statusAssessment", "actionPlan", "emailDraft"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Deep Dive Error:", error);
    throw error;
  }
};