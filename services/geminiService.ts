import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Difficulty, QuestionData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getDifficultyForLevel = (level: number): Difficulty => {
  if (level <= 10) return Difficulty.Easy;
  if (level <= 30) return Difficulty.Medium;
  if (level <= 70) return Difficulty.Hard;
  return Difficulty.Extreme;
};

// We rotate categories to keep it interesting
const CATEGORIES = [
  "Coding - Output Prediction",
  "Coding - Debugging",
  "Coding - Logic",
  "Coding - Big O Notation",
  "Tech Trivia",
  "Logical Reasoning",
  "Cybersecurity Basics",
  "Web Development Quirk"
];

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "The text of the quiz question."
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 4 distinct multiple choice options."
    },
    correctIndex: {
      type: Type.INTEGER,
      description: "The zero-based index of the correct option (0-3)."
    },
    category: {
      type: Type.STRING,
      description: "The category of the question."
    },
    difficulty: {
      type: Type.STRING,
      description: "The difficulty level of the question."
    }
  },
  required: ["question", "options", "correctIndex", "category", "difficulty"]
};

// Helper to pause execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateQuestion = async (level: number): Promise<QuestionData> => {
  const difficulty = getDifficultyForLevel(level);
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  const prompt = `
    Generate a unique, single multiple-choice question for a "Hacker/Developer" themed quiz game.
    
    Level: ${level}
    Target Difficulty: ${difficulty}
    Category: ${category}
    
    Requirements:
    1. The question must be challenging and appropriate for the difficulty level.
    2. Provide exactly 4 options.
    3. Ensure there is strictly one correct answer.
    4. For coding questions, focus on concepts relevant to modern development (JS, Python, General CS).
    5. Do NOT repeat common/cliché "Hello World" questions.
    6. If difficulty is "Extreme", the question should require deep insight or catch subtle bugs.
    
    Return the result as a valid JSON object strictly matching the schema.
  `;

  try {
    let response;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: questionSchema,
            temperature: 0.8,
            // Disable thinking for lower latency since we need speed
            thinkingConfig: { thinkingBudget: 0 }
          }
        });
        
        // If successful, break the retry loop
        break;
      } catch (err: any) {
        // Identify rate limit or transient errors
        const isRateLimit = 
          err.status === 429 || 
          (err.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED')));
        
        const isServerUnavailable = err.status === 503;

        if ((isRateLimit || isServerUnavailable) && attempt < maxRetries - 1) {
          // Exponential backoff: 1000ms, 2000ms, 4000ms + random jitter
          const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(`Gemini API Error (Attempt ${attempt + 1}/${maxRetries}). Retrying in ${Math.round(waitTime)}ms...`, err.message);
          await delay(waitTime);
          continue;
        }
        
        // If not retryable or max retries reached, throw to outer catch
        throw err;
      }
    }

    const text = response?.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text) as any;
    
    // Runtime validation fallback
    if (!data.options || data.options.length !== 4) {
      throw new Error("Invalid options generated");
    }

    return {
      question: data.question,
      options: data.options,
      correctIndex: data.correctIndex,
      category: data.category,
      difficulty: difficulty
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback question in case of API failure to prevent crash
    return {
      question: "SYSTEM ALERT: EXTERNAL UPLINK SEVERED. What is the standard HTTP status code for 'Too Many Requests'?",
      options: ["404 Not Found", "500 Internal Server Error", "429 Too Many Requests", "403 Forbidden"],
      correctIndex: 2,
      category: "Offline Protocol",
      difficulty: difficulty
    };
  }
};