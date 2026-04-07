import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { buildSystemPrompt } from "./systemPrompt";
import { AppError } from "../../errors/AppError";

let cachedSpec: object | null = null;
let anthropicClient: Anthropic | null = null;

const getClient = (): Anthropic => {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AppError("errors:ai_not_configured", 503);
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
};

const getOpenApiSpec = (): object => {
  if (cachedSpec) {
    return cachedSpec;
  }

  // Try build path first (Docker container), then project root (dev)
  const candidates = [
    path.resolve(__dirname, "..", "..", "..", "..", "openapi.json"),
    path.resolve(__dirname, "..", "..", "..", "..", "..", "openapi.json"),
  ];

  for (const candidate of candidates) {
    try {
      const raw = fs.readFileSync(candidate, "utf-8");
      cachedSpec = JSON.parse(raw);
      return cachedSpec!;
    } catch {
      // Try next candidate
    }
  }

  // Final fallback: generate from swagger-jsdoc at runtime (dev only)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { swaggerSpec } = require("../../../../docs/backend/SwaggerConfig");
    cachedSpec = swaggerSpec as object;
    return cachedSpec;
  } catch {
    throw new AppError("errors:ai_spec_not_found", 503);
  }
};

export const ask = async (
  question: string,
  tenantId: number,
): Promise<string> => {
  const spec = getOpenApiSpec();
  const systemPrompt = buildSystemPrompt(spec);
  const client = getClient();

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: question }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    console.log(
      `[AI Telemetry] tenant=${tenantId} model=haiku input_tokens=${response.usage.input_tokens} output_tokens=${response.usage.output_tokens}`,
    );

    return textBlock.text;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error(`[AI Provider Error] tenant=${tenantId}:`, error);
    throw new AppError("errors:ai_service_unavailable", 503);
  }
};
