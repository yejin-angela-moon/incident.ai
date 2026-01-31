import { createAnthropic } from "@anthropic-ai/sdk";

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
