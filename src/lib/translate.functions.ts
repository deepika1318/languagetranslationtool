import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch } from "./ai-gateway.server";

const TranslateInput = z.object({
  text: z.string().min(1).max(5000),
  sourceLanguage: z.string().min(1),
  targetLanguage: z.string().min(1),
});

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TranslateInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Translation service is not configured.");

    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    const source =
      data.sourceLanguage === "auto"
        ? "the automatically detected language"
        : data.sourceLanguage;

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      system:
        "You are a professional translation engine. Translate the user's text " +
        `from ${source} to ${data.targetLanguage}. ` +
        "Output ONLY the translated text, with no explanations, quotes, or extra formatting. " +
        "Preserve the original meaning, tone, and line breaks.",
      prompt: data.text,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const translated = (await result.text).trim();
    return { translated };
  });
