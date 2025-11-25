import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface GeneratedSermon {
  onePoint: string;
  intro: string;
  me: string;
  we1: string;
  god: string;
  you: string;
  we2: string;
  out: string;
}

export const generateSermon = async (
  bookReference: string,
  versesText: string,
  currentOnePoint: string
): Promise<GeneratedSermon | null> => {
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are an expert sermon writer following Andy Stanley's "Communicating for a Change" methodology.
      
      Context:
      Scripture Reference: "${bookReference}"
      Scripture Text: "${versesText}"
      Current One Point (Main Idea): "${currentOnePoint}"
      
      Task:
      1. If the "One Point" is empty, generate a sticky, memorable Bottom Line based on the scripture.
      2. If the "One Point" is provided, use it as the anchor.
      3. Generate content for ALL sections of the sermon framework (Intro, Me, We, God, You, We, Out).
      
      Framework Guidance:
      - INTRO: Hook the audience. Start with a story or question.
      - ME: Build rapport. Share a personal struggle or perspective.
      - WE (1): Build tension. How does this affect us all?
      - GOD: Resolve tension. What does the text say? Exegete the scripture.
      - YOU: Application. Specific challenge.
      - WE (2): Inspiration. Vision of a better future if we apply this.
      - OUT: Conclusion. Land the plane.
      
      Tone: Conversational, engaging, spoken-word style.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            onePoint: { type: Type.STRING, description: "The sticky statement or bottom line." },
            intro: { type: Type.STRING },
            me: { type: Type.STRING },
            we1: { type: Type.STRING },
            god: { type: Type.STRING },
            you: { type: Type.STRING },
            we2: { type: Type.STRING },
            out: { type: Type.STRING },
          },
          required: ["onePoint", "intro", "me", "we1", "god", "you", "we2", "out"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedSermon;
    }
    return null;
  } catch (error) {
    console.error("Error generating sermon:", error);
    return null;
  }
};
