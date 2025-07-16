import { env } from "@/env";
import ical from "ical";
import { DailySchedule, SCHOOL_YEAR_END, SCHOOL_YEAR_START } from "./schedule";
import { DateTime, Interval } from "luxon";
import { z } from "zod";
import { emptyDay, standardSchedules } from "./schedule-templates";
import {
  dailyScheduleSchema,
  deserializeSchedule,
  setDailySchedule,
} from "@/redis/days";
import { generateObject, generateText } from "ai";
import { model } from "@/lib/ai";

type EventStub = {
  title: string;
  description?: string;
  date: string;
};

export async function importCalendar() {
  const calendarResponse = await fetch(env.IMPORT_CALENDAR_URL);

  if (!calendarResponse.ok) throw Error("Failed to fetch calendar");

  const icsString = await calendarResponse.text();

  const data = await ical.parseICS(icsString);

  const schoolYearInterval = Interval.fromDateTimes(
    SCHOOL_YEAR_START,
    SCHOOL_YEAR_END,
  );

  const allDays: Record<string, EventStub> = {};

  for (const [k, event] of Object.entries(data)) {
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

  for (const day of Object.values(allDays)) {
    setDailySchedule(
      DateTime.fromISO(day.date),
      await eventStubToSchedule(day),
    );
  }

  for (const interval of schoolYearInterval.splitBy({ day: 1 })) {
    const date = interval.start!;
    const iso = date.toISODate();

    if (!(iso in allDays)) {
      await setDailySchedule(date, null);
    }
  }

  // console.log(Object.keys(allDays).join("\n"));
}

async function eventStubToSchedule(stub: EventStub): Promise<DailySchedule> {
  const defaultSchedule = standardSchedules.find(
    (s) => s.name === stub.title.trim(),
  );

  if (defaultSchedule) {
    let message;

    if (!defaultSchedule.days.includes(DateTime.fromISO(stub.date).weekday)) {
      message = defaultSchedule.displayName;
    }

    return {
      periods: defaultSchedule.periods,
      message,
    };
  } else {
    const schedule = await stubToScheduleAI(stub);

    console.log({ schedule });
    return schedule;
  }
}

async function stubToScheduleAI(stub: EventStub): Promise<DailySchedule> {
  const { object } = await generateObject({
    model: model,
    schema: dailyScheduleSchema,
    mode: "json",
    maxRetries: 5,
    experimental_repairText: async ({ text }) => {
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

    The above was a single-day exception to a high school bell schedule. Your job is to transcribe it into the provided json format.

    **IMPORTANT: The \`interval\` field must only EVER contain 24-hour time, so you'll need to convert it.**
    
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
    In the \`message\` field, include a 1 or 2 word (~3 at the very max), HUMAN-READABLE (appears only in UI, include spaces, make it look nice) title that either (a) highlights why this change in schedule exists (eg. "Spring Rally", "CAASPP Testing", "Finals") or (b) explains what the structure is (eg. "Even Periods" or "Monday Schedule"). Do not try to do both as this may make the message too long. In many cases it will be identical to the provided \`title\` field but will usually be shorter, cutting nonsensical filler like "SP-Day".
    Passing periods: sometimes they're explicitly given, other times you need to infer that they exist based on the gaps in time between periods. You should always *explicitly output* them in your json whenever you see a gap. It's very important that you do this for the UI.
    If there is ever a passing period immediately following a \`"break"\`-type period (lunch or brunch), disregard the passing period and EXTEND the \`"break"\` period's end time to compensate, such that the brunch or lunch feeds directly into the next period with no gap in between. Even if there isn't an _explicit_ passing period, there might still be a gap in time. If this is the case, you should still expand a brunch or lunch period to end at the same time the next instructional period starts. Do this ONLY for the boundary between break periods and instructional periods. Two INSTRUCTIONAL periods should ALWAYS have passing periods between them, unless the timing given in the schedule makes you SUPER confident that isn't the case.
    If it seems like school is off for the day, still include a message but use an empty array for the periods.

    IF YOU DON'T REMEMBER THE FOLLOWING TWO THINGS, EVERYTHING WILL BREAK.
    REMEMBER: The schedule is provided in 12 hour time, but YOU MUST CONVERT THE INTERVALS TO 24 HOUR TIME.
    
    Intervals must include minutes, hours, and seconds, each component having exactly two digits (pad with a zero if necessary).
    

    Think it out first (explicitly write out all the times and their conversions into 24hr), do at least 3 iterations until you're confident you're matching all of the above criteria. As a last check, make sure you don't have any passing periods immediately following break periods (brunch OR lunch, check BOTH, brunch is easy to miss), as explained above. Then once you're satisfied, output your final JSON in a code block. Your final result should be the last code block you send.
    `,
  });

  return deserializeSchedule(JSON.stringify(object));
}
