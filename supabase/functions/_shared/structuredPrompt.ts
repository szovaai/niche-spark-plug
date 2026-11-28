import { z } from "npm:zod";

// JSON-object providers do not receive Output.object schemas automatically.
export function structuredJSONPrompt(prompt: string, schema: z.ZodType): string {
  return `${prompt}\nReturn JSON only. The top-level object and all fields must match this JSON Schema exactly:\n${JSON.stringify(z.toJSONSchema(schema))}`;
}