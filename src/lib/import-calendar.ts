import { env } from "@/env";
import ical from "ical";
import {
  DailySchedule,
  Period,
  SCHOOL_YEAR_END,
  SCHOOL_YEAR_START,
} from "./schedule";
import { DateTime, Interval } from "luxon";
import { z } from "zod";
import { standardSchedules } from "./schedule-templates";
import {
  dailyScheduleSchema,
  deserializeSchedule,
  setDailySchedule,
} from "@/redis/days";
import { getCachedLLMResult, setCachedLLMResult } from "@/redis/llm-cache";
import { generateObject } from "ai";
import { model } from "@/lib/ai";

export type UsedMessage = {
  date: string;
  inputTitle: string;
  outputMessage: string;
};

export type EventStub = {
  title: string;
  description?: string;
  date: string;
};

// Parse the iCal content and extract events for the school year
export async function parseCalendarEvents(): Promise<EventStub[]> {
  const calendarResponse = await fetch(env.IMPORT_CALENDAR_URL);

  if (!calendarResponse.ok) throw Error("Failed to fetch calendar");

  const icsString = await calendarResponse.text();

  const data = ical.parseICS(icsString);

  const schoolYearInterval = Interval.fromDateTimes(
    SCHOOL_YEAR_START,
    SCHOOL_YEAR_END,
  );

  const allDays: Record<string, EventStub> = {};

  for (const [, event] of Object.entries(data)) {
    if (event.type !== "VEVENT") continue;
    if (event.start === undefined) continue;
    if (event.end === undefined) continue;

    if (event.rrule === undefined) {
      const dateTime = DateTime.fromJSDate(event.start).setZone("utc", {
        keepLocalTime: true,
      });

      if (
        !dateTime ||
        !dateTime.isValid ||
        !schoolYearInterval.contains(dateTime)
      )
        continue;

      const isoDate = dateTime.toISODate();

      allDays[isoDate] = {
        title: event.summary ?? "",
        description: event.description,
        date: isoDate,
      };
    } else {
      const dateTimes = event.rrule
        .between(
          SCHOOL_YEAR_START.toJSDate(),
          SCHOOL_YEAR_END.toJSDate(),
          true,
          () => true,
        )
        .map((d) => DateTime.fromJSDate(d));

      for (const i in dateTimes) {
        const dateTime = dateTimes[i];

        if (dateTime.hour === 23) {
          dateTimes[i] = dateTime.plus({ hours: 1 });
        }
      }

      const dates = dateTimes.map((d) => d.toISODate());

      let recurrences;

      if (event.recurrences) {
        // I hate this library, can't even get their types right
        recurrences = z
          .record(z.string(), z.custom<ical.CalendarComponent>())
          .parse({ ...event.recurrences });
        dates.push(
          ...Object.values(recurrences).map((d) =>
            DateTime.fromJSDate(d.start!)
              .setZone("utc", {
                keepLocalTime: true,
              })
              .toISODate(),
          ),
        );
      }

      for (const date of dates) {
        let curEvent = event;
        let showRecurrence = true;

        const dateLookupKey = date!;

        // For each date that we're checking, it's possible that there is a recurrence override for that one day.
        if (recurrences && recurrences[dateLookupKey]) {
          curEvent = recurrences[dateLookupKey];
        } else if (curEvent.exdate && curEvent.exdate[dateLookupKey]) {
          // This date is an exception date, which means we should skip it in the recurrence pattern.
          showRecurrence = false;
        }

        if (!schoolYearInterval.contains(DateTime.fromISO(dateLookupKey))) {
          showRecurrence = false;
        }

        if (showRecurrence) {
          allDays[dateLookupKey] = {
            title: curEvent.summary ?? "",
            description: curEvent.description,
            date: dateLookupKey,
          };
        }
      }
    }
  }

  return Object.values(allDays);
}

// Process events that don't need LLM calls (standard schedules)
export async function processStandardEvents(
  events: EventStub[],
): Promise<{ needsLLM: EventStub[]; updatedDates: string[] }> {
  const needsLLM: EventStub[] = [];
  const updatedDates: string[] = [];

  for (const event of events) {
    const defaultSchedule = standardSchedules.find(
      (s) => s.name === event.title.trim(),
    );

    if (defaultSchedule) {
      // This is a standard schedule, process it immediately
      let message;
      if (
        !defaultSchedule.days.includes(DateTime.fromISO(event.date).weekday)
      ) {
        message = defaultSchedule.displayName;
      }

      const schedule: DailySchedule = {
        periods: defaultSchedule.periods,
        message,
      };

      const hasChanged = await setDailySchedule(
        DateTime.fromISO(event.date),
        schedule,
      );
      if (hasChanged) {
        updatedDates.push(event.date);
      }
    } else {
      // This needs LLM processing
      needsLLM.push(event);
    }
  }

  return { needsLLM, updatedDates };
}

// Process a single event that needs LLM calls
export async function processSingleLLMEvent(
  event: EventStub,
  usedMessages: UsedMessage[],
): Promise<{ newUsedMessages: UsedMessage[]; hasChanged: boolean }> {
  const newUsedMessages = [...usedMessages];

  const schedule = await stubToScheduleAI(event, newUsedMessages);

  if (
    schedule.message &&
    !schedule.message.toLocaleLowerCase().includes("special schedule")
  ) {
    newUsedMessages.push({
      date: event.date,
      inputTitle: event.title,
      outputMessage: schedule.message,
    });
  }

  const hasChanged = await setDailySchedule(
    DateTime.fromISO(event.date),
    schedule,
  );

  return { newUsedMessages, hasChanged };
}

// Clear schedules for days not in the calendar
export async function clearUnusedDays(
  processedEvents: EventStub[],
): Promise<string[]> {
  const schoolYearInterval = Interval.fromDateTimes(
    SCHOOL_YEAR_START,
    SCHOOL_YEAR_END,
  );

  const processedDates = new Set(processedEvents.map((e) => e.date));
  const updatedDates: string[] = [];

  for (const interval of schoolYearInterval.splitBy({ day: 1 })) {
    const date = interval.start!;
    const iso = date.toISODate();

    if (!processedDates.has(iso)) {
      const hasChanged = await setDailySchedule(date, null);
      if (hasChanged) {
        updatedDates.push(iso);
      }
    }
  }

  return updatedDates;
}

async function stubToScheduleAI(
  stub: EventStub,
  usedMessages: UsedMessage[],
): Promise<DailySchedule> {
  const cachedResult = await getCachedLLMResult(stub.date, stub);
  if (cachedResult) {
    return cachedResult;
  }

  const dateTime = DateTime.fromISO(stub.date);
  const standardSchedule = standardSchedules.find((d) =>
    d.days.includes(dateTime.weekday),
  );

  const { object } = await generateObject({
    model: model,
    schema: dailyScheduleSchema,
    mode: "json",
    maxRetries: 5,
    experimental_repairText: async ({ text }) => {
      console.log(text);
      // If the model gives an empty code block at the end, ignore it.
      let t = text;

      if (text.trim().endsWith("```json\n```")) {
        t = text.trim();
        t = t.substring(0, t.length - 11);
      }

      // Return the last code block
      const parts = t.split("```json");
      const chunk = parts[parts.length - 1].trim();
      const chunk2 = chunk.split("```")[0].trim();
      return chunk2;
    },
    prompt: `
    ${JSON.stringify(stub)}

    Please help! My school's bell schedule is different today for a specific reason. It would normally be ${standardSchedule?.aiDescription}, but today it's NOT. it's changed to the above. Your job is to transcribe it into the provided json format.
    
    You should use the following values for \`name\` and \`id\` fields wherever possible, but it's okay to make up your own if none of the options fit (eg. "5th Period Final" for the human readable name and "finals-5" for the id). Instructional and break periods should ALWAYS have an \`id\`, even if you have to make one up. It has to be a real string, not null or undefined. Passing periods should NEVER have an \`id\`.
    | id       | name       | type          |
    |----------|------------|---------------|
    | period-1 | 1st Period | instructional |
    | period-2 | 2nd Period | instructional |
    | period-3 | 3rd Period | instructional |
    | period-4 | 4th Period | instructional |
    | period-5 | 5th Period | instructional |
    | period-6 | 6th Period | instructional |
    | period-7 | 7th Period | instructional |
    | lunch    | Lunch      | break         |
    | brunch   | Brunch     | break         |
    | academy  | Academy    | instructional |
    |          |            | passing       |
    In the \`message\` field, include a 1 or 2 word (~3 at the very max), HUMAN-READABLE (appears only in UI, include spaces, make it look nice), HELPFUL title that either (a) highlights why this change in schedule exists (eg. "Spring Rally", "CAASPP Testing", "Finals") or if you can't figure out why, (b) explains what the structure is (eg. "Even Periods", "Monday Schedule", "Shorter Classes"). Do not try to do both as this may make the message too long. In many cases it will be identical to the provided \`title\` field but will usually be shorter. When trying to figure out what the change is for, first come up with what you think any abbreviations in the given title stand for (eg. SP = special, BTSN = back to school night). If all the title tells you is that it's a "special schedule" then you need to try EXTRA HARD to figure out what the CHANGES to the schedule are and describe them in the title. Today is a ${dateTime.weekdayLong}, which, if this day were normal, would have this schedule:
    ${JSON.stringify(standardSchedule?.periods)}

    Use the following order of priority when determining what kind of message to use, moving to the next option only when you believe an option with a higher priority would not be as helpful:
    1. Describes WHY there's a deviation (eg. Back to School Night).
    2. Describes a change to WHICH periods are present (eg. "Odd Periods" or "Fire Drill")
    3. Describes a change to the ORDER of periods (eg. Inverted Academy)
    4. Describes a change to the DURATION of periods (eg. "Shorter Classes" or "Extended Academy")

    **Forbidden messages**
    - NEVER say "Special Schedule" or even the word "Special", "SP", or "Modified" unless it's the ONLY THING YOU CAN THINK OF because it's WAY TOO VAGUE. We KNOW that it's a modified schedule already, so that wouldn't be helpful. Instead, say _how_ or _why_ it's been modified. When you're stuck, you should always try to figure out what the differences between the changed schedule and the normal one are. Compare the _order_ and the _timing_ of the two schedules.
    - Breaks (brunch and lunch) NEVER change in length. If you think they did, then you didn't take the passing period into account and you need to make your tables again. Brunch is always 15 minutes if you consider the passing period right after.
    - Today would _normally_ be ${standardSchedule?.aiDescription} but today is DIFFERENT, so you shouldn't even CONSIDER calling it that.
    - "Sequential Periods" -- just give a range, like 1-5 or All Periods (the school has 7 periods total)
    - Any message longer than 22 characters as it won't fit in the UI


    To keep naming consistent, here some messages you've used so far: ${JSON.stringify(usedMessages)}
    
    If it seems like school is off for the day, use an empty array for the periods. Don't say "No school" as the message as that already appears in the UI when there aren't any periods. Either give _why_ there's no school or omit the message altogether.

    ---
    
    IF YOU DON'T REMEMBER THE FOLLOWING TWO THINGS, EVERYTHING WILL BREAK.
    REMEMBER: The schedule is provided in 12 hour time, but YOU MUST CONVERT THE INTERVALS TO 24 HOUR TIME.
    Intervals must include minutes, hours, and seconds, each component having exactly two digits (pad with a zero if necessary).
    
    ---

    Do these EXACT steps in the EXACT order. Don't write any JSON until _after_ you've iterated on your message:
    1. Make a table for both, the original and modified schedules, including period names, start and end times, and durations. Omit passing periods from these tables and extend brunch and lunch so that they have the same length as the unmodified schedule.
    2. List out what's different in which periods are present
    3. To find changes to the order of periods, make one table listing out the first period of each schedule, the second, third, etc. Then list differences in the ordering you find.
    4. If the periods are in the same order, use the tables from step 1 to list out any changes to the durations of periods.
    5. Iterate on your \`message\`. Each time you iterate, come up with a _stellar_ message, evaluate how helpful it is based on each of the above criteria, and make changes if could be classified as vague or redundant. Be _super careful_ if the modified schedule is similar to the original.
    6. Convert all the intervals in the modified schedule into 24-hr time with two digits each for hours, minutes, and seconds.
    7. Start writing out the modified schedule to match the JSON format. Do multiple iterations if necesary, then output your final JSON in a code block. Your final result should be the last code block you send. ONLY OUTPUT THE MODIFIED SCHEDULE, NOT THE ORIGINAL.
    `,
  });

  const rawSchedule = deserializeSchedule(JSON.stringify(object));
  const processedSchedule = postProcessSchedule(rawSchedule);

  await setCachedLLMResult(stub.date, stub, processedSchedule);

  return processedSchedule;
}

function postProcessSchedule(schedule: DailySchedule): DailySchedule {
  // First, fill any gaps with passing periods
  const periodsWithPassingPeriods = fillGapsWithPassingPeriods(
    schedule.periods,
  );

  // Then, extend break periods to absorb following passing periods
  const processedPeriods: Period[] = [];

  for (let i = 0; i < periodsWithPassingPeriods.length; i++) {
    const period = periodsWithPassingPeriods[i];
    const nextPeriod = periodsWithPassingPeriods[i + 1];

    // If this is a break period and the next period is a passing period,
    // extend this break period and skip the passing period
    if (period.type === "break" && nextPeriod?.type === "passing") {
      const followingPeriod = periodsWithPassingPeriods[i + 2];
      if (followingPeriod) {
        // Extend the break period to the start of the following instructional period
        processedPeriods.push({
          ...period,
          interval: Interval.fromDateTimes(
            period.interval.start!,
            followingPeriod.interval.start!,
          ),
        });
        // Skip the next two periods (passing and the one we just extended to)
        i += 2;
        // Add the following period
        processedPeriods.push(followingPeriod);
      } else {
        // No following period, just add the break period as-is
        processedPeriods.push(period);
        i++; // Skip the passing period
      }
    } else {
      processedPeriods.push(period);
    }
  }

  return {
    ...schedule,
    periods: processedPeriods,
  };
}

function fillGapsWithPassingPeriods(periods: Period[]): Period[] {
  if (periods.length === 0) return periods;

  const result: Period[] = [];

  for (let i = 0; i < periods.length; i++) {
    const currentPeriod = periods[i];
    const nextPeriod = periods[i + 1];

    result.push(currentPeriod);

    // Check if there's a gap between this period and the next
    if (
      nextPeriod &&
      currentPeriod.interval.end! < nextPeriod.interval.start!
    ) {
      // Add a passing period to fill the gap
      result.push({
        type: "passing",
        interval: Interval.fromDateTimes(
          currentPeriod.interval.end!,
          nextPeriod.interval.start!,
        ),
      });
    }
  }

  return result;
}
