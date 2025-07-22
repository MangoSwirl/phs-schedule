import { redis } from "./index";
import crypto from "crypto";

const CALENDAR_HASH_KEY = "calendar:hash";

export function calculateCalendarHash(icsContent: string): string {
  return crypto.createHash("sha256").update(icsContent).digest("hex");
}

export async function getStoredCalendarHash(): Promise<string | null> {
  return await redis.get(CALENDAR_HASH_KEY);
}

export async function setStoredCalendarHash(hash: string): Promise<void> {
  await redis.set(CALENDAR_HASH_KEY, hash);
}

export async function hasCalendarChanged(icsContent: string): Promise<boolean> {
  const currentHash = calculateCalendarHash(icsContent);
  const storedHash = await getStoredCalendarHash();
  return currentHash !== storedHash;
}
