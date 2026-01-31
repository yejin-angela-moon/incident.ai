import express from "express";
import { generateText } from "../ai/GenerateText.js";
import { anthropic } from "../ai/Model.js";

const chatRouter = express.Router();

chatRouter.post("/", async (req, res, next) => {
  try {
    const { prompt } = req.body;

    // Using a default model, you can make this dynamic if needed
    const model = anthropic("claude-3-5-sonnet-20240620");

    const { text } = await generateText({
      model: model,
      prompt: prompt,
    });

    res.json({ response: text });
  } catch (error) {
    next(error);
  }
});

export default chatRouter;
