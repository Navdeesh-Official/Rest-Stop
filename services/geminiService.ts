import { GoogleGenAI, Type } from "@google/genai";
import { AiAnalysis, RouteData, Toilet } from "../types";

// Safety check: Don't initialize if key is missing (though prompt guarantees it)
const apiKey = "AIzaSyAIv7vcG8fkZY8u_zzoMtzOQtZRCJnsWpM";
const ai = new GoogleGenAI({ apiKey });

export const analyzeRouteWithAi = async (
  route: RouteData, 
  toilets: Toilet[]
): Promise<AiAnalysis> => {
  if (!apiKey) {
    return {
      advice: "AI analysis unavailable (Missing API Key).",
      comfortRating: "Medium",
      longGaps: false
    };
  }

  const durationHours = (route.duration / 3600).toFixed(1);
  const distanceKm = (route.distance / 1000).toFixed(1);
  const toiletCount = toilets.length;
  const wheelchairAccessibleCount = toilets.filter(t => t.wheelchair === 'yes').length;
  const freeCount = toilets.filter(t => t.fee === 'no').length;

  const prompt = `
    Analyze this travel route data:
    - Total Duration: ${durationHours} hours
    - Total Distance: ${distanceKm} km
    - Total Restroom Facilities Found: ${toiletCount}
    - Wheelchair Accessible: ${wheelchairAccessibleCount}
    - Free to use: ${freeCount}

    Determine if this route has sufficient restroom coverage. 
    Provide a short, friendly summary of advice (max 2 sentences).
    Rate the "Comfort Level" as High, Medium, or Low.
    Flag if there are potential long gaps without facilities.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: { type: Type.STRING },
            comfortRating: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            longGaps: { type: Type.BOOLEAN }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      advice: result.advice || "Enjoy your trip!",
      comfortRating: (result.comfortRating as any) || "Medium",
      longGaps: !!result.longGaps
    };

  } catch (error) {
    console.error("AI analysis failed:", error);
    return {
      advice: "Could not analyze route at this time.",
      comfortRating: "Medium",
      longGaps: false
    };
  }
};

export const getToiletDetails = async (toilet: Toilet): Promise<string> => {
    if (!apiKey) return "No AI details available.";
    
    const prompt = `
      Based on these tags for a restroom facility, give a 1-sentence helpful tip:
      Name: ${toilet.name}
      Type: ${toilet.access}
      Fee: ${toilet.fee}
      Wheelchair: ${toilet.wheelchair}
      
      Example tips: "Likely clean but requires a purchase", "Public and free, good for quick stops".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Standard facility.";
    } catch (e) {
        return "Standard facility.";
    }
}
