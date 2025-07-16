import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    RESEND_KEY: z.string(),
    NOTIFICATION_EMAIL: z.string().email(),
    UPSTASH_URL: z.string(),
    UPSTASH_TOKEN: z.string(),
    IMPORT_CALENDAR_URL: z.string().url(),
  },
  runtimeEnv: {
    RESEND_KEY: process.env.RESEND_KEY,
    NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
    UPSTASH_URL: process.env.UPSTASH_URL,
    UPSTASH_TOKEN: process.env.UPSTASH_TOKEN,
    IMPORT_CALENDAR_URL: process.env.IMPORT_CALENDAR_URL,
  },
});
