import { z } from "zod";

export const envSchema = z.object({
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.string(),
	DB_URL: z.string().optional(),
	DB_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
