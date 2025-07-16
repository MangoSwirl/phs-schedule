import { env } from "@/env";
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: env.UPSTASH_URL,
  token: env.UPSTASH_TOKEN,
  automaticDeserialization: false,
});
