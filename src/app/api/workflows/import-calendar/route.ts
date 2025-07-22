import { serve } from "@upstash/workflow/nextjs";
import { env } from "@/env";
import {
  hasCalendarChanged,
  setStoredCalendarHash,
  calculateCalendarHash,
} from "@/redis/calendar-hash";
import {
  parseCalendarEvents,
  processStandardEventsBatch,
  processSingleLLMEvent,
  clearUnusedDays,
  UsedMessage,
  EventStub,
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

  // Parse calendar events first
  const allEvents = await context.run("parse-calendar", async () => {
    return await parseCalendarEvents();
  });

  // Process standard schedules in batches to avoid timeout
  const batchSize = 50;
  const batches: EventStub[][] = [];
  for (let i = 0; i < allEvents.length; i += batchSize) {
    batches.push(allEvents.slice(i, i + batchSize));
  }

  let allNeedsLLM: EventStub[] = [];
  let allStandardUpdatedDates: string[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batchResult = await context.run(
      `process-standard-batch-${i}`,
      async () => {
        return await processStandardEventsBatch(batches[i], batchSize);
      },
    );

    allNeedsLLM.push(...batchResult.needsLLM);
    allStandardUpdatedDates.push(...batchResult.updatedDates);
  }

  const { llmEvents, updatedDates } = {
    llmEvents: allNeedsLLM,
    updatedDates: allStandardUpdatedDates,
  };

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
  // Clear unused days
  const clearedUpdatedDates = await context.run(
    "clear-unused-days",
    async () => {
      return await clearUnusedDays(allEvents);
    },
  );

  // Update the stored hash
  await context.run("update-calendar-hash", async () => {
    const newHash = calculateCalendarHash(icsString);
    await setStoredCalendarHash(newHash);
  });

  // Invalidate changed pages
  await context.run("invalidate-pages", async () => {
    // Combine all updated dates and invalidate only those that changed
    const allUpdatedDates = Array.from(
      new Set([
        ...updatedDates,
        ...workflowState.llmUpdatedDates,
        ...clearedUpdatedDates,
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
