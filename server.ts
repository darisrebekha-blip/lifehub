import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI client server-side
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // AI & Voice Command route for LifeHub
  app.post("/api/ai/command", async (req, res) => {
    try {
      const { command, contextState } = req.body;
      if (!command) {
        return res.status(400).json({ error: "Command is required" });
      }

      if (!ai) {
        // Fallback if no GEMINI_API_KEY is configured
        return res.json({
          actionType: "general_response",
          summary: `Received command: "${command}". (Note: Add GEMINI_API_KEY in Secrets for live AI processing).`
        });
      }

      const prompt = `You are LifeHub AI Assistant. Analyze the user command and extract structural actions if applicable.
User Command: "${command}"
Current Context: ${JSON.stringify(contextState || {})}

Determine if the command is asking to:
1. 'add_task': create a new task. Required: title, priority ('HIGH', 'MED', or 'LOW').
2. 'add_expense': log an expense. Required: title, amount (number), category.
3. 'log_water': log water intake in ml (number, e.g. 250 or 500).
4. 'update_scratchpad': append or write quick notes.
5. 'general_response': answer questions, give productivity tips, summary, or advice.

Respond strictly in JSON according to schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              actionType: {
                type: Type.STRING,
                description: "One of: 'add_task', 'add_expense', 'log_water', 'update_scratchpad', 'general_response'"
              },
              summary: {
                type: Type.STRING,
                description: "Friendly conversational response or confirmation message to display to user."
              },
              taskPayload: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING }
                }
              },
              expensePayload: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  category: { type: Type.STRING }
                }
              },
              waterAmountMl: { type: Type.NUMBER },
              scratchpadPayload: { type: Type.STRING }
            },
            required: ["actionType", "summary"]
          }
        }
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error("No text output from Gemini");
      }

      const jsonResult = JSON.parse(textOutput);
      return res.json(jsonResult);
    } catch (error: any) {
      console.error("Error handling AI command:", error);
      return res.status(500).json({
        actionType: "general_response",
        summary: "I encountered an error processing your command. Please try again or rephrase.",
        error: error.message
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "LifeHub" });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LifeHub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
