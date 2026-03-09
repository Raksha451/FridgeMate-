import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function identifyFood(base64Image: string): Promise<{ name: string; category: string; estimatedExpiryDays: number } | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: "Identify this food item. Return the name of the food, a broad category (e.g., Vegetable, Fruit, Dairy, Meat, Pantry), and an estimated shelf life in days from today if stored properly in a fridge or pantry. Return as JSON.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            estimatedExpiryDays: { type: Type.NUMBER },
          },
          required: ["name", "category", "estimatedExpiryDays"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error identifying food:", error);
    return null;
  }
}

export async function suggestRecipes(inventory: FoodItem[]): Promise<string> {
  const inventoryList = inventory.map(item => `${item.name} (expires: ${item.expiryDate})`).join(", ");
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `I have the following items in my fridge/pantry: ${inventoryList}. 
      Suggest 3 simple recipes I can make using these ingredients. 
      Prioritize items that are expiring soon. 
      Format the output in clean Markdown with sections for each recipe.`,
      config: {
        systemInstruction: "You are a creative chef focused on reducing food waste. Suggest practical, delicious recipes based on available ingredients.",
      },
    });

    return response.text || "No recipes found.";
  } catch (error) {
    console.error("Error suggesting recipes:", error);
    return "Failed to get recipe suggestions.";
  }
}
