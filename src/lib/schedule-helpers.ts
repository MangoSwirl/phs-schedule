import { Interval, DateTime } from "luxon";
import { DailySchedule, Period } from "./schedule";
import { emptyDay } from "./schedule-templates";

const formatAsOrdinal = (number: number): string => {
  const suffixes = ["th", "st", "nd", "rd"];
  const lastDigit = number % 10;
  return suffixes[lastDigit] || suffixes[0];
};
export const instructionalPeriod = (
  number: number,
  start: string,
  end: string,
): Period => {
  return {
    id: `period-${number}`,
    type: "instructional",
    name: `${number}${formatAsOrdinal(number)} Period`,
    interval: Interval.fromDateTimes(
      DateTime.fromISO(start),
      DateTime.fromISO(end),
    ),
  };
};
export const finalPeriod = (
  number: number,
  start: string,
  end: string,
): Period => {
  return {
    id: `final-${number}`,
    type: "instructional",
    name: `Final Exam ${number}`,
    interval: Interval.fromDateTimes(
      DateTime.fromISO(start),
      DateTime.fromISO(end),
    ),
  };
};
export const academyPeriod = (start: string, end: string): Period => {
  return {
    id: "academy",
    type: "instructional",
    name: "Academy",
    interval: Interval.fromDateTimes(
      DateTime.fromISO(start),
      DateTime.fromISO(end),
    ),
  };
};
export const lunchPeriod = (start: string, end: string): Period => {
  return {
    id: "lunch",
    type: "break",
    name: "Lunch",
    interval: Interval.fromDateTimes(
      DateTime.fromISO(start),
      DateTime.fromISO(end),
    ),
  };
};
export const brunchPeriod = (start: string, end: string): Period => {
  return {
    id: "brunch",
    type: "break",
    name: "Brunch",
    interval: Interval.fromDateTimes(
      DateTime.fromISO(start),
      DateTime.fromISO(end),
    ),
  };
};
export const passingPeriod = (start: string, end?: string): Period => ({
  type: "passing",
  interval: Interval.fromDateTimes(
    DateTime.fromISO(start),
    end ? DateTime.fromISO(end) : DateTime.fromISO(start).plus({ minutes: 10 }),
  ),
});

export const vacation = (
  startDay: string,
  endDay: string,
  message?: string,
): Record<string, DailySchedule> => {
  const schedule: DailySchedule = {
    message,
    ...emptyDay,
  };

  const days: Record<string, DailySchedule> = {};

  for (
    let day = DateTime.fromISO(startDay);
    day <= DateTime.fromISO(endDay);
    day = day.plus({ days: 1 })
  ) {
    if (!day.isWeekend) {
      days[day.toFormat("yyyy-LL-dd")] = schedule;
    }
  }

  return days;
};
