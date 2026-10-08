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
import { SCHOOL_YEAR_START, SCHOOL_YEAR_END, DailySchedule } from "./schedule";

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
        ? event.summary.slice(9)[2]
        : event.summary;
      const matches = Array.from(
        event.description.matchAll(
          /<tr>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>\s*<\/tr>/g,
        ),
      );
      const schedule = matches
        .map((match) => {
          // Helper to strip HTML tags and non-breaking spaces
          const cleanText = (text: string) =>
            text
              .replace(/<[^>]*>/g, "") // Removes tags like <b>, </b>, etc.
              .replace(/&nbsp;|\u00A0/g, " ") // Replaces non-breaking spaces with normal spaces
              .trim();

          // Helper to convert time strings to "HH:mm:ss" (24h format)
          const to24Hour = (timeStr: string) => {
            if (!timeStr) return "";

            const s = timeStr.replace(/^-+\s*/, "").trim();

            // Try parsing as 12-hour format with AM/PM (e.g., "8:30 AM")
            let dt = DateTime.fromFormat(s, "h:mm a");

            // If that fails, try parsing as 24-hour format (e.g., "8:30" or "08:30")
            if (!dt.isValid) {
              dt = DateTime.fromFormat(s, "H:mm");
            }

            // Return in "HH:mm:ss" format if valid, otherwise return original cleaned string
            return dt.isValid ? dt.toFormat("HH:mm:ss") : s;
          };

          return {
            name: cleanText(match[1]),
            startTime: to24Hour(cleanText(match[2])),
            endTime: to24Hour(cleanText(match[3])),
          };
        })
        .filter((s) => s.name || s.startTime || s.endTime);
      const periods = [];

      for (const period of schedule) {
        if (!period.startTime || !period.endTime) continue;
        const iv = Interval.fromDateTimes(
          DateTime.fromISO(period.startTime),
          DateTime.fromISO(period.endTime),
        );
        if (!iv.isValid) continue;
        if (period.name.startsWith("Period ")) {
          periods.push(
            instructionalPeriod(
              Number(period.name.slice(-1)),
              period.startTime,
              period.endTime,
            ),
          );
        } else if (period.name.startsWith("Academy")) {
          periods.push(academyPeriod(period.startTime, period.endTime));
        } else if (period.name.startsWith("Lunch")) {
          periods.push(lunchPeriod(period.startTime, period.endTime));
        } else if (period.name.startsWith("Brunch")) {
          periods.push(brunchPeriod(period.startTime, period.endTime));
        } else if (period.name.startsWith("Passing")) {
          periods.push(passingPeriod(period.startTime, period.endTime));
        } else {
          periods.push({
            id: period.name,
            type: "instructional" as const,
            name: period.name,
            interval: iv,
          });
        }
      }

      const year = event.startDate.getFullYear();
      const month = String(event.startDate.getMonth() + 1).padStart(2, "0");
      const day = String(event.startDate.getDate()).padStart(2, "0");

      const formatted = `${year}-${month}-${day}`;
      dayOverrides[formatted] = { message, periods };
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
