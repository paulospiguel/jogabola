import { GameEvent, GamePart, GameType, Player } from "@/types/timer";
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not defined in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMatchSummary = async (
  events: GameEvent[],
  currentPart: GamePart,
  totalDuration: number,
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Unable to generate summary: API Key missing.";

  const prompt = `
    You are a professional soccer commentator. Analyze the following match events and provide a concise, exciting, and professional summary of the match so far. 
    
    Current Match State: ${currentPart}
    Duration Played: ${Math.floor(totalDuration / 60)} minutes
    
    Events Log:
    ${events.map(e => `- ${e.formattedTime} (${e.gamePart}): ${e.type}`).join("\n")}

    If there are no events, comment on the intensity of the play based on the time elapsed.
    Keep the tone energetic. Use Markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Error generating match summary:", error);
    return "Failed to generate match summary due to an error.";
  }
};

export const generateBalancedTeams = async (
  players: Player[],
  gameType: GameType,
): Promise<{ teamAIds: string[]; teamBIds: string[] }> => {
  const ai = getClient();
  if (!ai) throw new Error("API Key missing");

  // Only consider players that are currently in the list
  const playerList = players.map(p => ({
    id: p.id,
    role: p.position,
    skill: p.skill,
  }));

  const prompt = `
    You are an expert soccer coach. I need you to divide these players into two balanced teams (Team A and Team B) for a ${gameType} match.
    
    Strategies:
    1. Balance the total Skill level between teams.
    2. Distribute positions logically (e.g., ensure goalkeepers are split if possible).
    3. Return a JSON object with exactly two keys: "teamA" and "teamB", which are arrays containing the player IDs.

    Players:
    ${JSON.stringify(playerList)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const result = JSON.parse(text);
    return {
      teamAIds: result.teamA || [],
      teamBIds: result.teamB || [],
    };
  } catch (error) {
    console.error("Error generating teams:", error);
    throw error;
  }
};
