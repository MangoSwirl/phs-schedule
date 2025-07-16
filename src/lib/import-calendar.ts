import { env } from "@/env";
import ical from "ical";
import { DailySchedule, SCHOOL_YEAR_END, SCHOOL_YEAR_START } from "./schedule";
import { DateTime, Interval } from "luxon";
import { z } from "zod";
import {
  emptyDay,
  evenPeriods,
  mondayPeriods,
  oddPeriods,
  standardSchedules,
} from "./schedule-templates";
import { setDailySchedule } from "@/redis/days";

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
    return {
      ...emptyDay,
      message: "Special schedule",
    };
  }
}
