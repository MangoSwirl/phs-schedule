import { DateTime, Interval } from "luxon";
import { DailySchedule } from "./schedule";
import {
  emptyDay,
  evenPeriods,
  mondayPeriods,
  oddPeriods,
} from "./schedule-templates";
import {
  instructionalPeriod,
  brunchPeriod,
  passingPeriod,
  lunchPeriod,
  vacation,
  finalPeriod,
  academyPeriod,
} from "./schedule-helpers";

export const dayOverrides: Record<string, DailySchedule> = {
  "2025-08-12": { periods: mondayPeriods, message: "Monday schedule" },
  "2025-08-13": { periods: mondayPeriods, message: "Monday schedule" },
  "2025-08-18": {
    message: "Fire drill",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:10:00"),
      passingPeriod("09:10:00"),
      instructionalPeriod(2, "09:20:00", "10:00:00"),
      brunchPeriod("10:00:00", "10:15:00"),
      instructionalPeriod(3, "10:15:00", "10:55:00"),
      passingPeriod("10:55:00"),
      instructionalPeriod(4, "11:05:00", "11:45:00"),
      passingPeriod("11:45:00"),
      instructionalPeriod(5, "11:55:00", "12:35:00"),
      lunchPeriod("12:35:00", "13:15:00"),
      instructionalPeriod(6, "13:15:00", "13:55:00"),
      {
        id: "drill-review",
        type: "instructional",
        name: "Fire Drill Review",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("13:55:00"),
          DateTime.fromISO("14:05:00"),
        ),
      },
      {
        id: "drill",
        type: "instructional",
        name: "Fire Drill",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("14:05:00"),
          DateTime.fromISO("14:35:00"),
        ),
      },
      passingPeriod("14:35:00"),
      instructionalPeriod(7, "14:45:00", "15:25:00"),
    ],
  },
  "2025-08-25": {
    message: "Testing",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:00:00"),
      passingPeriod("09:00:00"),
      instructionalPeriod(2, "09:10:00", "09:40:00"),
      brunchPeriod("09:40:00", "09:55:00"),
      instructionalPeriod(3, "09:55:00", "10:25:00"),
      passingPeriod("10:25:00"),
      instructionalPeriod(4, "10:35:00", "11:05:00"),
      passingPeriod("11:05:00"),
      instructionalPeriod(5, "11:15:00", "11:45:00"),
      lunchPeriod("11:45:00", "12:25:00"),
      instructionalPeriod(6, "12:25:00", "12:55:00"),
      passingPeriod("12:55:00"),
      instructionalPeriod(7, "13:05:00", "13:35:00"),
      passingPeriod("13:35:00"),
      {
        id: "testing-academy",
        type: "instructional",
        name: "Testing/Academy",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("13:45:00"),
          DateTime.fromISO("15:25:00"),
        ),
      },
    ],
  },

  "2025-09-01": {
    ...emptyDay,
    message: "Labor Day",
  },
  "2025-09-04": {
    message: "Back to school night",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:50:00"),
      brunchPeriod("09:50:00", "10:05:00"),
      instructionalPeriod(3, "10:05:00", "11:25:00"),
      passingPeriod("11:25:00"),
      instructionalPeriod(5, "11:35:00", "12:55:00"),
    ],
  },
  "2025-09-05": {
    message: "After back to school night",
    periods: [
      instructionalPeriod(2, "08:30:00", "09:50:00"),
      brunchPeriod("09:50:00", "10:05:00"),
      instructionalPeriod(4, "10:05:00", "11:25:00"),
      passingPeriod("11:25:00"),
      instructionalPeriod(6, "11:35:00", "12:55:00"),
      lunchPeriod("12:55:00", "13:35:00"),
      instructionalPeriod(7, "13:35:00", "14:55:00"),
    ],
  },

  "2025-09-26": {
    message: "Homecoming Rally",
    periods: [
      instructionalPeriod(2, "08:30:00", "10:00:00"),
      brunchPeriod("10:00:00", "10:15:00"),
      instructionalPeriod(4, "10:15:00", "11:45:00"),
      passingPeriod("11:45:00"),
      {
        id: "homecoming-rally",
        type: "instructional",
        name: "Homecoming Rally",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("11:55:00"),
          DateTime.fromISO("12:40:00"),
        ),
      },
      lunchPeriod("12:40:00", "13:20:00"),
      instructionalPeriod(6, "13:20:00", "14:50:00"),
    ],
  },

  "2025-09-24": {
    message: "Shelter in place",
    periods: evenPeriods,
  },

  "2025-10-13": {
    message: "Indigenous Peoples' Day",
    ...emptyDay,
  },
  "2025-10-16": {
    message: "Great Shakeout",
    periods: [
      instructionalPeriod(1, "08:30:00", "10:00:00"),
      brunchPeriod("10:00:00", "10:15:00"),
      {
        id: "drill",
        type: "instructional",
        name: "Earthquake Drill",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("10:15:00"),
          DateTime.fromISO("11:45:00"),
        ),
      },
      passingPeriod("11:45:00"),
      instructionalPeriod(5, "11:55:00", "13:25:00"),
      lunchPeriod("13:25:00", "14:05:00"),
      instructionalPeriod(7, "14:05:00", "15:35:00"),
    ],
  },
  "2025-10-17": {
    message: "Post-Drill Schedule",
    periods: [
      instructionalPeriod(2, "08:30:00", "09:50:00"),
      brunchPeriod("09:50:00", "10:05:00"),
      instructionalPeriod(3, "10:05:00", "11:25:00"),
      passingPeriod("11:25:00"),
      instructionalPeriod(4, "11:35:00", "12:55:00"),
      lunchPeriod("12:55:00", "13:35:00"),
      instructionalPeriod(6, "13:35:00", "14:55:00"),
    ],
  },

  "2025-11-03": {
    message: "Lockdown Drill",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:10:00"),
      passingPeriod("09:10:00"),
      instructionalPeriod(2, "09:20:00", "10:00:00"),
      brunchPeriod("10:00:00", "10:15:00"),
      instructionalPeriod(3, "10:15:00", "10:55:00"),
      passingPeriod("10:55:00"),
      instructionalPeriod(4, "11:05:00", "11:45:00"),
      passingPeriod("11:45:00"),
      instructionalPeriod(5, "11:55:00", "12:35:00"),
      lunchPeriod("12:35:00", "13:15:00"),
      instructionalPeriod(6, "13:15:00", "13:55:00"),
      passingPeriod("13:55:00"),
      instructionalPeriod(7, "14:05:00", "14:45:00"),
      {
        id: "drill-review",
        name: "Lockdown Review",
        type: "instructional",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("14:45:00"),
          DateTime.fromISO("14:55:00"),
        ),
      },
      {
        id: "drill",
        name: "Lockdown",
        type: "instructional",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("14:55:00"),
          DateTime.fromISO("15:25:00"),
        ),
      },
    ],
  },

  "2025-11-10": {
    message: "Tuesday schedule",
    periods: evenPeriods,
  },
  "2025-11-11": {
    message: "Veterans Day",
    ...emptyDay,
  },

  ...vacation("2025-11-24", "2025-11-28", "Thanksgiving Break"),

  "2025-12-15": {
    periods: [
      instructionalPeriod(1, "08:30:00", "09:30:00"),
      brunchPeriod("09:30:00", "09:45:00"),
      instructionalPeriod(2, "09:45:00", "10:45:00"),
      passingPeriod("10:45:00"),
      instructionalPeriod(3, "10:55:00", "12:00:00"),
      lunchPeriod("12:00:00", "12:40:00"),
      instructionalPeriod(4, "12:40:00", "13:40:00"),
      passingPeriod("13:40:00"),
      instructionalPeriod(5, "13:50:00", "14:50:00"),
    ],
  },
  "2025-12-16": {
    message: "Finals",
    periods: [
      finalPeriod(2, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "10:50:00"),
      instructionalPeriod(6, "10:50:00", "11:50:00"),
      passingPeriod("11:50:00"),
      instructionalPeriod(7, "12:00:00", "13:00:00"),
    ],
  },
  "2025-12-17": {
    message: "Finals",
    periods: [
      finalPeriod(3, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(5, "11:00:00", "13:00:00"),
    ],
  },
  "2025-12-18": {
    message: "Finals",
    periods: [
      finalPeriod(4, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(6, "11:00:00", "13:00:00"),
    ],
  },
  "2025-12-19": {
    message: "Finals",
    periods: [
      finalPeriod(1, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(7, "11:00:00", "13:00:00"),
    ],
  },

  ...vacation("2025-12-22", "2026-01-06", "Winter Break"),

  "2026-01-07": {
    message: "Monday schedule",
    periods: mondayPeriods,
  },
  "2026-01-12": {
    message: "Testing",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:00:00"),
      passingPeriod("09:00:00"),
      instructionalPeriod(2, "09:10:00", "09:40:00"),
      brunchPeriod("09:40:00", "09:55:00"),
      instructionalPeriod(3, "09:55:00", "10:25:00"),
      passingPeriod("10:25:00"),
      instructionalPeriod(4, "10:35:00", "11:05:00"),
      passingPeriod("11:05:00"),
      {
        id: "academy",
        type: "instructional",
        name: "Testing/Academy",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("11:15:00"),
          DateTime.fromISO("12:55:00"),
        ),
      },
      passingPeriod("12:55:00"),
      instructionalPeriod(5, "13:05:00", "13:35:00"),
      lunchPeriod("13:35:00", "14:15:00"),
      instructionalPeriod(6, "14:15:00", "14:45:00"),
      passingPeriod("14:45:00"),
      instructionalPeriod(7, "14:55:00", "15:25:00"),
    ],
  },

  "2026-01-19": {
    message: "Martin Luther King Jr. Day",
    ...emptyDay,
  },
  "2026-01-26": {
    message: "Fire Drill",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:10:00"),
      {
        id: "drill-review",
        type: "instructional",
        name: "Fire Drill Review",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("09:10:00"),
          DateTime.fromISO("09:20:00"),
        ),
      },
      {
        id: "drill",
        type: "instructional",
        name: "Fire Drill",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("09:20:00"),
          DateTime.fromISO("09:50:00"),
        ),
      },
      brunchPeriod("09:50:00", "10:05:00"),
      instructionalPeriod(2, "10:05:00", "10:45:00"),
      passingPeriod("10:45:00"),
      instructionalPeriod(3, "10:55:00", "11:35:00"),
      passingPeriod("11:35:00"),
      instructionalPeriod(4, "11:45:00", "12:25:00"),
      passingPeriod("12:25:00"),
      instructionalPeriod(5, "12:35:00", "13:15:00"),
      lunchPeriod("13:15:00", "13:55:00"),
      instructionalPeriod(6, "13:55:00", "14:35:00"),
      passingPeriod("14:35:00"),
      instructionalPeriod(7, "14:45:00", "15:25:00"),
    ],
  },

  "2026-02-03": {
    message: "Shelter in place",
    periods: oddPeriods,
  },

  ...vacation("2026-02-16", "2026-02-20", "Ski Week"),

  "2026-03-02": {
    message: "Reverse Lockdown",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:10:00"),
      passingPeriod("09:10:00"),
      instructionalPeriod(2, "09:20:00", "10:00:00"),
      brunchPeriod("10:00:00", "10:15:00"),
      instructionalPeriod(3, "10:15:00", "10:55:00"),
      passingPeriod("10:55:00"),
      instructionalPeriod(4, "11:05:00", "11:45:00"),
      passingPeriod("11:45:00"),
      {
        id: "drill",
        type: "instructional",
        name: "Reverse Lockdown",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("11:55:00"),
          DateTime.fromISO("12:25:00"),
        ),
      },
      passingPeriod("12:25:00"),
      instructionalPeriod(5, "12:35:00", "13:15:00"),
      lunchPeriod("13:15:00", "13:55:00"),
      instructionalPeriod(6, "13:55:00", "14:35:00"),
      passingPeriod("14:35:00"),
      instructionalPeriod(7, "14:45:00", "15:25:00"),
    ],
  },
  "2026-03-06": {
    message: "Career Day",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:55:00"),
      brunchPeriod("09:55:00", "10:10:00"),
      academyPeriod("10:10:00", "11:10:00"),
      passingPeriod("11:10:00"),
      instructionalPeriod(4, "11:20:00", "12:45:00"),
      lunchPeriod("12:45:00", "13:25:00"),
      instructionalPeriod(6, "13:25:00", "14:50:00"),
    ],
  },

  "2026-03-09": {
    message: "Friday schedule",
    periods: evenPeriods,
  },
  "2026-03-13": emptyDay,

  "2026-03-16": emptyDay,

  "2026-03-20": {
    message: "Spring Rally",
    periods: [
      instructionalPeriod(2, "08:30:00", "10:00:00"),
      brunchPeriod("10:00:00", "10:15:00"),
      instructionalPeriod(4, "10:15:00", "11:45:00"),
      passingPeriod("11:45:00"),
      {
        id: "spring-rally",
        type: "instructional",
        name: "Spring Rally",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("11:55:00"),
          DateTime.fromISO("12:40:00"),
        ),
      },
      lunchPeriod("12:40:00", "13:20:00"),
      instructionalPeriod(6, "13:20:00", "14:50:00"),
    ],
  },

  "2026-03-24": {
    message: "CAASPP Testing",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:35:00"),
      brunchPeriod("09:35:00", "09:50:00"),
      {
        id: "academy",
        type: "instructional",
        name: "Testing/Academy",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("09:50:00"),
          DateTime.fromISO("11:20:00"),
        ),
      },
      passingPeriod("11:20:00"),
      instructionalPeriod(3, "11:30:00", "12:35:00"),
      lunchPeriod("12:35:00", "13:15:00"),
      instructionalPeriod(5, "13:15:00", "14:20:00"),
      passingPeriod("14:20:00"),
      instructionalPeriod(7, "14:30:00", "15:35:00"),
    ],
  },
  "2026-03-25": {
    message: "CAASPP Testing",
    periods: [
      instructionalPeriod(2, "08:30:00", "09:45:00"),
      brunchPeriod("09:45:00", "10:00:00"),
      {
        id: "academy",
        type: "instructional",
        name: "Testing/Academy",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("10:00:00"),
          DateTime.fromISO("11:30:00"),
        ),
      },
      passingPeriod("11:30:00"),
      instructionalPeriod(4, "11:40:00", "12:55:00"),
      lunchPeriod("12:55:00", "13:35:00"),
      instructionalPeriod(6, "13:35:00", "14:50:00"),
    ],
  },

  "2026-03-31": {
    message: "CAASPP Testing",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:35:00"),
      brunchPeriod("09:35:00", "09:50:00"),
      {
        id: "academy",
        type: "instructional",
        name: "Testing/Academy",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("09:50:00"),
          DateTime.fromISO("11:20:00"),
        ),
      },
      passingPeriod("11:20:00"),
      instructionalPeriod(3, "11:30:00", "12:35:00"),
      lunchPeriod("12:35:00", "13:15:00"),
      instructionalPeriod(5, "13:15:00", "14:20:00"),
      passingPeriod("14:20:00"),
      instructionalPeriod(7, "14:30:00", "15:35:00"),
    ],
  },
  "2026-04-01": {
    message: "CAASPP Testing",
    periods: [
      instructionalPeriod(2, "08:30:00", "09:45:00"),
      brunchPeriod("09:45:00", "10:00:00"),
      {
        id: "academy",
        type: "instructional",
        name: "Testing/Academy",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("10:00:00"),
          DateTime.fromISO("11:30:00"),
        ),
      },
      passingPeriod("11:30:00"),
      instructionalPeriod(4, "11:40:00", "12:55:00"),
      lunchPeriod("12:55:00", "13:35:00"),
      instructionalPeriod(6, "13:35:00", "14:50:00"),
    ],
  },

  ...vacation("2026-04-06", "2026-04-10", "Spring Break"),

  "2026-04-13": {
    message: "Secondary location fire drill",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:10:00"),
      passingPeriod("09:10:00"),
      instructionalPeriod(2, "09:20:00", "10:00:00"),
      brunchPeriod("10:00:00", "10:15:00"),
      instructionalPeriod(3, "10:15:00", "10:55:00"),
      passingPeriod("10:55:00"),
      instructionalPeriod(4, "11:05:00", "11:45:00"),
      passingPeriod("11:45:00"),
      {
        id: "drill-review",
        type: "instructional",
        name: "Drill Review",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("11:55:00"),
          DateTime.fromISO("12:05:00"),
        ),
      },
      {
        id: "drill",
        type: "instructional",
        name: "Drill",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("12:05:00"),
          DateTime.fromISO("12:35:00"),
        ),
      },
      instructionalPeriod(5, "12:35:00", "13:15:00"),
      lunchPeriod("13:15:00", "13:55:00"),
      instructionalPeriod(6, "13:55:00", "14:35:00"),
      passingPeriod("14:35:00"),
      instructionalPeriod(7, "14:45:00", "15:25:00"),
    ],
  },

  "2026-04-20": {
    message: "Testing",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:00:00"),
      passingPeriod("09:00:00"),
      instructionalPeriod(2, "09:10:00", "09:40:00"),
      passingPeriod("09:40:00"),
      instructionalPeriod(3, "09:50:00", "10:20:00"),
      brunchPeriod("10:20:00", "10:35:00"),
      instructionalPeriod(4, "10:35:00", "11:05:00"),
      passingPeriod("11:05:00"),
      {
        id: "academy",
        type: "instructional",
        name: "Extended Academy",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("11:15:00"),
          DateTime.fromISO("12:55:00"),
        ),
      },
      lunchPeriod("12:55:00", "13:35:00"),
      instructionalPeriod(5, "13:35:00", "14:05:00"),
      passingPeriod("14:05:00"),
      instructionalPeriod(6, "14:15:00", "14:45:00"),
      passingPeriod("14:45:00"),
      instructionalPeriod(7, "14:55:00", "15:25:00"),
    ],
  },

  "2026-05-22": {
    message: "Day on the Green",
    periods: [
      instructionalPeriod(2, "08:30:00", "10:00:00"),
      brunchPeriod("10:00:00", "10:15:00"),
      instructionalPeriod(4, "10:15:00", "11:45:00"),
      passingPeriod("11:45:00"),
      instructionalPeriod(6, "11:55:00", "13:25:00"),
      passingPeriod("13:25:00", "13:30:00"),
      {
        id: "day-on-the-green",
        type: "instructional",
        name: "Day on the Green",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("13:30:00"),
          DateTime.fromISO("15:00:00"),
        ),
      },
    ],
  },

  "2026-05-25": {
    message: "Memorial Day",
    ...emptyDay,
  },
  "2026-05-26": {
    message: "Monday schedule",
    periods: mondayPeriods,
  },
  "2026-05-29": {
    message: "Pre-Finals schedule",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:30:00"),
      brunchPeriod("09:30:00", "09:45:00"),
      instructionalPeriod(2, "09:45:00", "10:45:00"),
      passingPeriod("10:45:00"),
      instructionalPeriod(3, "10:55:00", "12:00:00"),
      lunchPeriod("12:00:00", "12:40:00"),
      instructionalPeriod(4, "12:40:00", "13:40:00"),
      passingPeriod("13:40:00"),
      instructionalPeriod(5, "13:50:00", "14:50:00"),
    ],
  },

  "2026-06-01": {
    message: "Finals",
    periods: [
      finalPeriod(2, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "10:50:00"),
      instructionalPeriod(6, "10:50:00", "11:50:00"),
      passingPeriod("11:50:00"),
      instructionalPeriod(7, "12:00:00", "13:00:00"),
    ],
  },
  "2026-06-02": {
    message: "Finals",
    periods: [
      finalPeriod(3, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(5, "11:00:00", "13:00:00"),
    ],
  },
  "2026-06-03": {
    message: "Finals",
    periods: [
      finalPeriod(4, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(6, "11:00:00", "13:00:00"),
    ],
  },
  "2026-06-04": {
    message: "Finals",
    periods: [
      finalPeriod(1, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(7, "11:00:00", "13:00:00"),
    ],
  },
};
