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
  "2024-08-12": {
    message: "Shortened classes",
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
    ],
  },
  "2024-08-13": { periods: mondayPeriods, message: "Monday schedule" },
  "2024-08-14": { periods: mondayPeriods, message: "Monday schedule" },

  "2024-08-20": {
    message: "Fire drill",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:50:00"),
      brunchPeriod("09:50:00", "09:55:00"),
      instructionalPeriod(3, "10:05:00", "11:25:00"),
      passingPeriod("11:25:00"),
      {
        id: "drill-review",
        type: "instructional",
        name: "Drill Review",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("11:35:00"),
          DateTime.fromISO("11:45:00"),
        ),
      },
      {
        id: "drill",
        type: "instructional",
        name: "Drill",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("11:45:00"),
          DateTime.fromISO("12:15:00"),
        ),
      },
      instructionalPeriod(5, "12:15:00", "13:35:00"),
      lunchPeriod("13:35:00", "14:15:00"),
      instructionalPeriod(7, "14:15:00", "15:35:00"),
    ],
  },

  "2024-09-02": {
    ...emptyDay,
    message: "Labor Day",
  },
  "2024-09-05": {
    message: "Back to school night",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:50:00"),
      passingPeriod("09:50:00"),
      instructionalPeriod(3, "10:00:00", "11:20:00"),
      brunchPeriod("11:20:00", "11:35:00"),
      instructionalPeriod(5, "11:35:00", "12:55:00"),
      lunchPeriod("12:55:00", "13:25:00"),
    ],
  },
  "2024-09-06": {
    message: "After back to school night",
    periods: [
      instructionalPeriod(2, "08:30:00", "09:50:00"),
      passingPeriod("09:50:00"),
      instructionalPeriod(4, "10:00:00", "11:20:00"),
      brunchPeriod("11:20:00", "11:35:00"),
      instructionalPeriod(6, "11:35:00", "12:55:00"),
      lunchPeriod("12:55:00", "13:35:00"),
      instructionalPeriod(7, "13:35:00", "14:55:00"),
    ],
  },

  "2024-09-20": {
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

  "2024-09-27": {
    message: "Consent Assembly",
    periods: [
      instructionalPeriod(2, "08:30:00", "10:00:00"),
      brunchPeriod("10:00:00", "10:15:00"),
      instructionalPeriod(4, "10:15:00", "11:45:00"),
      passingPeriod("11:45:00"),
      {
        id: "academy",
        type: "instructional",
        name: "Academy",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("11:55:00"),
          DateTime.fromISO("12:40:00"),
        ),
      },
      lunchPeriod("12:40:00", "13:20:00"),
      instructionalPeriod(6, "13:20:00", "14:50:00"),
    ],
  },

  "2024-09-25": {
    message: "Shelter in place",
    periods: evenPeriods,
  },

  "2024-10-14": {
    message: "Indigenous Peoples' Day",
    ...emptyDay,
  },
  "2024-10-17": {
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
  "2024-10-18": {
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

  "2024-11-04": {
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
      {
        id: "drill-review",
        name: "Lockdown Review",
        type: "instructional",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("11:55:00"),
          DateTime.fromISO("12:05:00"),
        ),
      },
      {
        id: "drill",
        name: "Lockdown",
        type: "instructional",
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

  "2024-11-11": {
    message: "Veterans Day",
    ...emptyDay,
  },

  ...vacation("2024-11-25", "2024-11-29", "Thanksgiving Break"),

  "2024-12-16": {
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
  "2024-12-17": {
    message: "Finals",
    periods: [
      finalPeriod(2, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "10:50:00"),
      instructionalPeriod(6, "10:50:00", "11:50:00"),
      passingPeriod("11:50:00"),
      instructionalPeriod(7, "12:00:00", "13:00:00"),
    ],
  },
  "2024-12-18": {
    message: "Finals",
    periods: [
      finalPeriod(3, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(5, "11:00:00", "13:00:00"),
    ],
  },
  "2024-12-19": {
    message: "Finals",
    periods: [
      finalPeriod(4, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(6, "11:00:00", "13:00:00"),
    ],
  },
  "2024-12-20": {
    message: "Finals",
    periods: [
      finalPeriod(1, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(7, "11:00:00", "13:00:00"),
    ],
  },

  ...vacation("2024-12-23", "2025-01-07", "Winter Break"),

  "2025-01-08": {
    message: "Monday schedule",
    periods: mondayPeriods,
  },

  "2025-01-15": {
    message: "Fire drill",
    periods: [
      instructionalPeriod(2, "08:30:00", "09:50:00"),
      brunchPeriod("09:50:00", "10:05:00"),
      academyPeriod("10:05:00", "10:40:00"),
      passingPeriod("10:40:00"),
      instructionalPeriod(4, "10:50:00", "12:20:00"),
      {
        id: "drill",
        type: "instructional",
        name: "Fire drill",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("12:20:00"),
          DateTime.fromISO("12:50:00"),
        ),
      },
      lunchPeriod("12:50:00", "13:30:00"),
      instructionalPeriod(6, "13:30:00", "14:50:00"),
    ],
  },

  "2025-01-20": {
    message: "Martin Luther King Jr. Day",
    ...emptyDay,
  },

  "2025-02-04": {
    message: "Shelter in place",
    periods: oddPeriods,
  },

  ...vacation("2025-02-17", "2025-02-21", "Ski Week"),

  "2025-03-03": {
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
  "2025-03-07": {
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

  "2025-03-10": {
    message: "Friday schedule",
    periods: evenPeriods,
  },
  "2025-03-14": emptyDay,

  "2025-03-17": {
    message: "St. Patrick's Day",
    ...emptyDay,
  },

  "2025-03-25": {
    message: "CAASP Testing",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:35:00"),
      brunchPeriod("9:35:00", "9:50:00"),
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
  "2025-03-26": {
    message: "CAASP Testing",
    periods: [
      instructionalPeriod(2, "08:30:00", "09:45:00"),
      brunchPeriod("9:45:00", "10:00:00"),
      {
        id: "academy",
        type: "instructional",
        name: "Testing/Academy",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("10:00:00"),
          DateTime.fromISO("10:30:00"),
        ),
      },
      passingPeriod("10:30:00"),
      instructionalPeriod(4, "11:40:00", "12:55:00"),
      lunchPeriod("12:55:00", "13:35:00"),
      instructionalPeriod(6, "13:35:00", "14:50:00"),
    ],
  },

  "2025-04-01": {
    message: "CAASP Testing",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:35:00"),
      brunchPeriod("9:35:00", "9:50:00"),
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
  "2025-04-02": {
    message: "CAASP Testing",
    periods: [
      instructionalPeriod(2, "08:30:00", "09:45:00"),
      brunchPeriod("9:45:00", "10:00:00"),
      {
        id: "academy",
        type: "instructional",
        name: "Testing/Academy",
        interval: Interval.fromDateTimes(
          DateTime.fromISO("10:00:00"),
          DateTime.fromISO("10:30:00"),
        ),
      },
      passingPeriod("10:30:00"),
      instructionalPeriod(4, "11:40:00", "12:55:00"),
      lunchPeriod("12:55:00", "13:35:00"),
      instructionalPeriod(6, "13:35:00", "14:50:00"),
    ],
  },

  ...vacation("2025-04-07", "2025-04-11", "Spring Break"),

  "2025-04-28": {
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

  "2025-05-23": {
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
          DateTime.fromISO("15:30:00"),
        ),
      },
    ],
  },

  "2025-05-26": {
    message: "Memorial Day",
    ...emptyDay,
  },
  "2025-05-27": {
    message: "Monday schedule",
    periods: mondayPeriods,
  },
  "2025-05-30": {
    message: "Pre-Finals Schedule",
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

  "2025-06-02": {
    message: "Finals",
    periods: [
      finalPeriod(2, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "10:50:00"),
      instructionalPeriod(6, "10:50:00", "11:50:00"),
      passingPeriod("11:50:00"),
      instructionalPeriod(7, "12:00:00", "13:00:00"),
    ],
  },
  "2025-06-03": {
    message: "Finals",
    periods: [
      finalPeriod(3, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(5, "11:00:00", "13:00:00"),
    ],
  },
  "2025-06-04": {
    message: "Finals",
    periods: [
      finalPeriod(4, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(6, "11:00:00", "13:00:00"),
    ],
  },
  "2025-06-05": {
    message: "Finals",
    periods: [
      finalPeriod(1, "08:30:00", "10:30:00"),
      brunchPeriod("10:30:00", "11:00:00"),
      finalPeriod(7, "11:00:00", "13:00:00"),
    ],
  },
};
