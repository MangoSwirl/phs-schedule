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
  "2026-08-20": {
    message: "Thursday Assessment Calendar",
    periods: [
      instructionalPeriod(1, "08:30:00", "09:50:00"),
      brunchPeriod("09:50:00", "09:55:00"),
      passingPeriod("09:10:00"),
      instructionalPeriod(3, "10:05:00", "11:25:00"),
      passingPeriod("11:25:00"),
      instructionalPeriod(5, "11:35:00", "12:55:00"),
    ],
  },
  "2026-08-21": {
    message: "Friday Assessment Adjusted Schedule",
    periods: [
      instructionalPeriod(2, "08:30:00", "09:50:00"),
      brunchPeriod("09:50:00", "09:55:00"),
      passingPeriod("09:55:00"),
      instructionalPeriod(4, "10:05:00", "11:25:00"),
      passingPeriod("11:25:00"),
      instructionalPeriod(6, "11:35:00", "12:55:00"),
      lunchPeriod("12:55:00", "13:25:00"),
      passingPeriod("13:25:00"),
      instructionalPeriod(7, "13:35:00", "14:55:00"),
    ],
  },

  "2026-09-07": {
    ...emptyDay,
    message: "Labor Day",
  },
};
