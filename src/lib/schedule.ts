import { Interval, DateTime, Settings } from "luxon";

Settings.defaultZone = "America/Los_Angeles";

export type VisiblePeriod = {
  interval: Interval;
  id: string;
  type: "instructional" | "break";
  name: string;
};

export type InvisiblePeriod = {
  interval: Interval;
  type: "passing";
};

export type Period = VisiblePeriod | InvisiblePeriod;

export type PortablePeriod = (
  | Omit<VisiblePeriod, "interval">
  | Omit<InvisiblePeriod, "interval">
) & {
  interval: PortableInterval;
};

export type PortableInterval = {
  start?: string;
  end?: string;
};

export function intervalToPortable(interval: Interval): PortableInterval {
  return {
    start: interval.start?.toISO(),
    end: interval.end?.toISO(),
  };
}

export function portableToInterval(interval: PortableInterval): Interval {
  return Interval.fromDateTimes(
    DateTime.fromISO(interval.start ?? ""),
    DateTime.fromISO(interval.end ?? ""),
  );
}

export type DailySchedule = {
  periods: Period[];
  message?: string;
};

export const SCHOOL_YEAR_START = DateTime.fromISO("2025-08-11");
export const SCHOOL_YEAR_END = DateTime.fromISO("2026-06-04");

export function getScheduleForDay(day: DateTime): DailySchedule {
  // No school if it's before the start of the school year
  if (day < SCHOOL_YEAR_START) {
    return transformScheduleToDate(emptyDay, day);
  }

  // No school if it's after the end of the school year
  if (day > SCHOOL_YEAR_END) {
    return transformScheduleToDate(emptyDay, day);
  }

  // If the day is in the dayOverrides, use that
  if (day.toFormat("yyyy-LL-dd") in dayOverrides) {
    if (day.weekday === 2) {
      console.log(dayOverrides[day.toFormat("yyyy-LL-dd")]);
    }

    return transformScheduleToDate(
      dayOverrides[day.toFormat("yyyy-LL-dd")],
      day,
    );
  }

  return transformScheduleToDate(
    day.weekday in defaultSchedule
      ? defaultSchedule[day.weekday as WeekdayNumbers]
      : emptyDay,
    day,
  );
}

/// Returns a `DailySchedule` where each interval has the same time of day but uses the given date
export function transformScheduleToDate(
  schedule: DailySchedule,
  day: DateTime,
): DailySchedule {
  const transformedPeriods = schedule.periods.map(function (period) {
    return {
      ...period,
      interval: Interval.fromDateTimes(
        day.set({
          hour: period.interval.start?.hour,
          minute: period.interval.start?.minute,
        }),
        day.set({
          hour: period.interval.end?.hour,
          minute: period.interval.end?.minute,
        }),
      ),
    };
  });

  return {
    ...schedule,
    periods: transformedPeriods,
  };
}
