import z from 'zod';

export const TranslationRequestSchema = z.object({
  input: z.string(),
  from: z.string().optional(),
  to: z.string(),
  style: z.string().optional(),
  api: z.string(),
});
export type TranslationRequest = z.output<typeof TranslationRequestSchema>;

export interface ClaudeRequest {
  anthropic_version: string;
  max_tokens: number;
  messages: {
    role: string;
    content: {
      type: string;
      text: string;
    }[];
  }[];
}

export const StringBufferSchema = z
  .instanceof(Uint8Array)
  .transform((arg, ctx) => {
    try {
      return new TextDecoder().decode(arg);
    } catch (e: unknown) {
      ctx.addIssue({
        code: 'custom',
        message: e instanceof Error ? e.message : 'Unexpected buffer',
      });
      return z.NEVER;
    }
  });

export const JsonStringSchema = z.string().transform((arg, ctx): unknown => {
  try {
    return JSON.parse(arg);
  } catch (e: unknown) {
    ctx.addIssue({
      code: 'custom',
      message: e instanceof Error ? e.message : 'Unexpected buffer',
    });
    return z.NEVER;
  }
});

export const ClaudeResponseSchema = z.object({
  content: z
    .object({
      text: z.string(),
    })
    .array(),
});

export const TranslationResponseSchema = z.object({
  output: z.string(),
  from: z.string().optional(),
});
export type TranslationResponse = z.output<typeof TranslationResponseSchema>;

export const TranslationDeniedResponseSchema = z.object({
  message: z.string(),
});
export type TranslationErrorResponse = z.output<
  typeof TranslationDeniedResponseSchema
>;
