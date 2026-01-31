const express = require("express");
const { generateText } = require("ai");
const { anthropic } = require("../ai/Model");

const chatRouter = express.Router();

chatRouter.post("/", async (req, res, next) => {
  try {
    const { prompt } = req.body;

    // Using a default model
    const model = anthropic("claude-3-haiku-20240307");

    const { text } = await generateText({
      model: model,
      prompt: prompt,
    });

    res.json({ response: text });
  } catch (error) {
    next(error);
  }
});

module.exports = chatRouter;
