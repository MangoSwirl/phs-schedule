import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const model = createOpenAICompatible({
  baseURL: "https://ai.hackclub.com",
  name: "hackclub-ai",
}).chatModel("meta-llama/llama-4-maverick-17b-128e-instruct");
