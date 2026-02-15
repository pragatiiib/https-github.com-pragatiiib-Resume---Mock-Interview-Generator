
import { GoogleGenAI, Type } from "@google/genai";
import { InterviewTone, RedFlag, Question, Evaluation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeResume = async (resumeContent: string): Promise<RedFlag[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze the following resume for 'Red Flags' (weak points, gaps, vague descriptions, missing critical skills for the roles implied, etc.). Return a JSON array of objects with keys: issue, reason, howToFix, severity (low, medium, high). 
    Resume: ${resumeContent}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            issue: { type: Type.STRING },
            reason: { type: Type.STRING },
            howToFix: { type: Type.STRING },
            severity: { type: Type.STRING }
          },
          required: ["issue", "reason", "howToFix", "severity"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse red flags", e);
    return [];
  }
};

export const generateInitialQuestions = async (resumeContent: string, tone: InterviewTone): Promise<Question[]> => {
  const prompt = `Based on the following resume, generate 3 HR questions and 3 Technical questions suitable for a candidate. The tone of the interviewer is ${tone}.
  - Strict: Challenging, skeptical, focuses on precision.
  - Friendly: Encouraging, conversational, holistic.
  - Startup: Fast-paced, versatile, culture-fit focus.
  - MNC: Standardized, behavioral, process and hierarchy focused.
  
  Return a JSON array of objects with keys: text, type (HR or Technical).
  Resume: ${resumeContent}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            type: { type: Type.STRING }
          },
          required: ["text", "type"]
        }
      }
    }
  });

  try {
    const raw = JSON.parse(response.text || '[]');
    return raw.map((q: any, i: number) => ({
      ...q,
      id: `q-initial-${i}`
    }));
  } catch (e) {
    console.error("Failed to parse questions", e);
    return [];
  }
};

export const evaluateAnswer = async (
  resumeContent: string, 
  question: string, 
  answer: string, 
  tone: InterviewTone
): Promise<Evaluation> => {
  const prompt = `Act as an interviewer with a ${tone} tone. Evaluate the following candidate answer.
  Context:
  Resume: ${resumeContent}
  Question: ${question}
  Answer: ${answer}

  Return a JSON object with:
  1. score (0-100)
  2. feedback (A string reflecting the ${tone} tone)
  3. improvementTips (Array of strings)
  4. followUpQuestions (Array of 2 specific follow-up questions based on their answer)`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "feedback", "improvementTips", "followUpQuestions"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    throw new Error("Failed to evaluate answer");
  }
};
