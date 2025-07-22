import { serve } from "@upstash/workflow/nextjs";
import { env } from "@/env";
import {
  hasCalendarChanged,
  setStoredCalendarHash,
  calculateCalendarHash,
} from "@/redis/calendar-hash";
import {
  parseCalendarEvents,
  processStandardEvents,
  processSingleLLMEvent,
  clearUnusedDays,
  UsedMessage,
} from "@/lib/import-calendar";
import { revalidateSchedulePages } from "@/lib/revalidation";

export const { POST } = serve(async (context) => {
  const { icsString, shouldImport } = await context.run(
    "check-calendar-changes",
    async () => {
      // Fetch the calendar to check if it has changed
      const calendarResponse = await fetch(env.IMPORT_CALENDAR_URL);

      if (!calendarResponse.ok) {
        throw new Error("Failed to fetch calendar");
      }

      const icsString = await calendarResponse.text();

      // Check if calendar has changed
      const changed = await hasCalendarChanged(icsString);

      return {
        icsString,
        shouldImport: changed,
      };
    },
  );

  if (!shouldImport) {
    return {
      message: "Calendar unchanged, skipping import",
      imported: false,
    };
  }

  // Parse calendar events and process standard schedules
  const { allEvents, llmEvents } = await context.run(
    "parse-and-process-standard",
    async () => {
      const allEvents = await parseCalendarEvents();

      // Process all standard schedules at once (fast)
      const llmEvents = await processStandardEvents(allEvents);

      return { allEvents, llmEvents };
    },
  );

  // Process LLM events one at a time, maintaining message context
  let usedMessages: UsedMessage[] = [];

  for (let i = 0; i < llmEvents.length; i++) {
    const event = llmEvents[i];

    usedMessages = await context.run(`process-llm-event-${i}`, async () => {
      return await processSingleLLMEvent(event, usedMessages);
    });
  }

  // Final cleanup and revalidation
  await context.run("finalize-import", async () => {
    await clearUnusedDays(allEvents);

    // Update the stored hash
    const newHash = calculateCalendarHash(icsString);
    await setStoredCalendarHash(newHash);

    // Revalidate all schedule-related pages
    revalidateSchedulePages();
  });

  return {
    message: `Calendar imported successfully (${allEvents.length} events processed, ${llmEvents.length} needed LLM processing)`,
    imported: true,
    totalEvents: allEvents.length,
    llmEvents: llmEvents.length,
  };
});
