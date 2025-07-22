import { redis } from ".";
import { DailySchedule } from "@/lib/schedule";
import { serializeSchedule, deserializeSchedule } from "./days";
import { EventStub } from "@/lib/import-calendar";
import { createHash } from "crypto";

export function createLLMCacheKey(date: string, eventStub: EventStub): string {
  const stubHash = createHash("sha256")
    .update(
      JSON.stringify({
        title: eventStub.title,
        description: eventStub.description,
      }),
    )
    .digest("hex")
    .substring(0, 16);

  return `llm-cache:${date}:${stubHash}`;
}

export async function getCachedLLMResult(
  date: string,
  eventStub: EventStub,
): Promise<DailySchedule | null> {
  const key = createLLMCacheKey(date, eventStub);
  const cached = await redis.get(key);

  if (!cached) {
    return null;
  }

  return deserializeSchedule(JSON.stringify(cached));
}

export async function setCachedLLMResult(
  date: string,
  eventStub: EventStub,
  schedule: DailySchedule,
): Promise<void> {
  const key = createLLMCacheKey(date, eventStub);
  await redis.set(key, serializeSchedule(schedule));
}
