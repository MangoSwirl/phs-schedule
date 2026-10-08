import ICAL from "ical.js";
import crypto from "crypto";
import { DateTime, Interval } from "luxon";
import {
  academyPeriod,
  brunchPeriod,
  instructionalPeriod,
  lunchPeriod,
  passingPeriod,
} from "./schedule-helpers";
import {
  SCHOOL_YEAR_START,
  SCHOOL_YEAR_END,
  DailySchedule,
  Period,
} from "./schedule";

type IcsRow = {
  summary: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  uid: string;
};

let cachedIcs: IcsRow[] | null = null;
let cacheTime: number = 0;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

let cachedIcsTextHash: string | null = null;
let cachedParsedResult: IcsRow[] | null = null;

async function fetchAndParseIcs(): Promise<IcsRow[]> {
  const now = Date.now();
  if (cachedParsedResult && now - cacheTime < CACHE_TTL_MS) {
    return cachedParsedResult;
  }
  try {
    const response = await fetch(
      "https://calendar.google.com/calendar/ical/c_30d5a2c1a8f1c82ef97ae6a5339f97aee29fcd9c09fcd30a6c738022fff30753%40group.calendar.google.com/public/basic.ics",
      { cache: "no-cache" },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const icsText = await response.text();
    const textHash = crypto.createHash("sha256").update(icsText).digest("hex");

    if (
      cachedIcsTextHash &&
      cachedIcsTextHash === textHash &&
      cachedParsedResult
    ) {
      cacheTime = now;
      return cachedParsedResult;
    }

    const jCalData = ICAL.parse(icsText);
    const comp = new ICAL.Component(jCalData);
    const vevents = comp.getAllSubcomponents("vevent");

    let events = vevents.map((vevent) => {
      const event = new ICAL.Event(vevent);
      return {
        summary: event.summary,
        description: event.description,
        startDate: event.startDate.toJSDate(),
        endDate: event.endDate.toJSDate(),
        location: event.location,
        uid: event.uid,
      };
    });

    // in order
    events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    // only dates this school year
    events = events.filter(
      (ev) =>
        ev.startDate.getTime() >= SCHOOL_YEAR_START.toJSDate().getTime() &&
        ev.startDate.getTime() <= SCHOOL_YEAR_END.toJSDate().getTime(),
    );
    cachedParsedResult = events;
    cachedIcsTextHash = textHash;
    cacheTime = now;
    return events;
  } catch (error) {
    console.error("Failed to fetch or parse ICS:", error);
    if (cachedParsedResult) {
      return cachedParsedResult;
    }
    throw error;
  }
}

async function getOverridesFromIcs(ics: IcsRow[]) {
  const dayOverrides: Record<string, DailySchedule> = {};
  for (const event of ics) {
    if (event.startDate === event.endDate) continue;
    if (event.summary !== dayToSummary[event.startDate.getDate()]) {
      const message = event.summary.startsWith("SPECIAL")
        ? event.summary.slice(9)
        : event.summary;
      const matches = Array.from(
        event.description.matchAll(
          /<tr>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<\/tr>/g,
        ),
      );
      // Helper to strip HTML tags and non-breaking spaces
      const cleanText = (text: string) =>
        text
          .replace(/<[^>]*>/g, "") // Removes tags like <b>, </b>, etc.
          .replace(/&nbsp;|\u00A0/g, " ") // Replaces non-breaking spaces with normal spaces
          .trim();

      const schedule = matches.map((match) => ({
        name: cleanText(match[1]),
        startTime: cleanText(match[2]),
        endTime: cleanText(match[3]),
      }));

      // Parse a clock cell like "8:30", "8:30:00", "8:30 AM" or "8:30AM"
      const parseClock = (
        timeStr: string,
      ): { time: DateTime; hasMeridiem: boolean } | null => {
        const s = timeStr.replace(/^-+\s*/, "").trim();
        if (!s) return null;

        const withMeridiem = s.match(
          /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(a\.?m\.?|p\.?m\.?)$/i,
        );
        if (withMeridiem) {
          const dt = DateTime.fromFormat(
            `${Number(withMeridiem[1])}:${withMeridiem[2]} ${withMeridiem[3][0].toUpperCase()}M`,
            "h:mm a",
          );
          if (dt.isValid) return { time: dt, hasMeridiem: true };
        }

        for (const format of ["H:mm", "H:mm:ss"]) {
          const dt = DateTime.fromFormat(s, format);
          if (dt.isValid) return { time: dt, hasMeridiem: false };
        }
        return null;
      };

      // The source tables usually omit AM/PM, so resolve bare times against
      // the previous time in the table ("1:25" after "11:55" is 1:25 PM).
      let lastMinuteOfDay = -1;
      const resolveTime = (timeStr: string): DateTime | null => {
        const parsed = parseClock(timeStr);
        if (!parsed) return null;
        const { time, hasMeridiem } = parsed;
        const minutes = time.hour * 60 + time.minute;
        if (!hasMeridiem && minutes < lastMinuteOfDay && time.hour < 12) {
          const pm = time.plus({ hours: 12 });
          lastMinuteOfDay = Math.max(lastMinuteOfDay, pm.hour * 60 + pm.minute);
          return pm;
        }
        lastMinuteOfDay = Math.max(lastMinuteOfDay, minutes);
        return time;
      };

      const periods: Period[] = [];

      for (const period of schedule) {
        if (!period.name) continue;
        const start = resolveTime(period.startTime);
        const end = resolveTime(period.endTime);
        // Skip header/note rows and anything we couldn't parse into a real span
        if (!start || !end || end.toMillis() <= start.toMillis()) continue;

        const startTime = start.toFormat("HH:mm:ss");
        const endTime = end.toFormat("HH:mm:ss");

        if (period.name.startsWith("Period ")) {
          periods.push(
            instructionalPeriod(
              Number(period.name.slice(-1)),
              startTime,
              endTime,
            ),
          );
        } else if (period.name.startsWith("Academy")) {
          periods.push(academyPeriod(startTime, endTime));
        } else if (period.name.startsWith("Lunch")) {
          periods.push(lunchPeriod(startTime, endTime));
        } else if (period.name.startsWith("Brunch")) {
          periods.push(brunchPeriod(startTime, endTime));
        } else if (period.name.startsWith("Passing")) {
          periods.push(passingPeriod(startTime, endTime));
        } else {
          periods.push({
            id: period.name,
            type: "instructional" as const,
            name: period.name,
            interval: Interval.fromDateTimes(start, end),
          });
        }
      }

      // Insert invisible spacers for any gap the source table has no Passing
      // row for, so blocks aren't rendered flush against each other.
      const periodsWithSpacing: Period[] = [];
      for (const period of periods) {
        const previous = periodsWithSpacing[periodsWithSpacing.length - 1];
        if (
          previous &&
          previous.type !== "passing" &&
          period.type !== "passing" &&
          previous.interval.end &&
          period.interval.start &&
          period.interval.start > previous.interval.end
        ) {
          periodsWithSpacing.push(
            passingPeriod(
              previous.interval.end.toFormat("HH:mm:ss"),
              period.interval.start.toFormat("HH:mm:ss"),
            ),
          );
        }
        periodsWithSpacing.push(period);
      }

      const year = event.startDate.getFullYear();
      const month = String(event.startDate.getMonth() + 1).padStart(2, "0");
      const day = String(event.startDate.getDate()).padStart(2, "0");

      const formatted = `${year}-${month}-${day}`;
      dayOverrides[formatted] = { message, periods: periodsWithSpacing };
    }
  }
  return dayOverrides;
}

const dayToSummary: Record<number, string> = {
  1: "Monday Bell Schedule",
  2: "Tuesday/Thursday Bell Schedule",
  3: "Wednesday/Friday Bell Schedule ",
  4: "Tuesday/Thursday Bell Schedule",
  5: "Wednesday/Friday Bell Schedule ",
};

export async function generateDayOverrides() {
  try {
    const ics = await fetchAndParseIcs();

    return await getOverridesFromIcs(ics);
  } catch (error) {
    console.error("Error running script:", error);
  }
}
