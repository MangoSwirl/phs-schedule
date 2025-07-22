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
import { DateTime } from "luxon";

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
  const { allEvents, llmEvents, updatedDates } = await context.run(
    "parse-and-process-standard",
    async () => {
      const allEvents = await parseCalendarEvents();

      // Process all standard schedules at once (fast)
      const { needsLLM, updatedDates } = await processStandardEvents(allEvents);

      return { allEvents, llmEvents: needsLLM, updatedDates };
    },
  );

  // Process LLM events one at a time, maintaining message context
  let workflowState = await context.run(
    "initialize-llm-processing",
    async () => {
      return {
        usedMessages: [] as UsedMessage[],
        llmUpdatedDates: [] as string[],
      };
    },
  );

  for (let i = 0; i < llmEvents.length; i++) {
    const event = llmEvents[i];

    workflowState = await context.run(`process-llm-event-${i}`, async () => {
      const result = await processSingleLLMEvent(
        event,
        workflowState.usedMessages,
      );

      const newLlmUpdatedDates = result.hasChanged
        ? [...workflowState.llmUpdatedDates, event.date]
        : workflowState.llmUpdatedDates;

      return {
        usedMessages: result.newUsedMessages,
        llmUpdatedDates: newLlmUpdatedDates,
      };
    });
  }
  // Final cleanup and revalidation
  await context.run("finalize-import", async () => {
    const clearUpdatedDates = await clearUnusedDays(allEvents);

    // Update the stored hash
    const newHash = calculateCalendarHash(icsString);
    await setStoredCalendarHash(newHash);

    // Combine all updated dates and invalidate only those that changed
    const allUpdatedDates = Array.from(
      new Set([
        ...updatedDates,
        ...workflowState.llmUpdatedDates,
        ...clearUpdatedDates,
      ]),
    );

    if (allUpdatedDates.length > 0) {
      for (const dateStr of allUpdatedDates) {
        const date = DateTime.fromISO(dateStr);
        revalidateSchedulePages(date);
      }
    }
  });

  return {
    message: `Calendar imported successfully (${allEvents.length} events processed, ${llmEvents.length} needed LLM processing)`,
    imported: true,
    totalEvents: allEvents.length,
    llmEvents: llmEvents.length,
  };
});
