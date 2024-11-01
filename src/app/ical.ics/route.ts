import {
  DailySchedule,
  getScheduleForDay,
  SCHOOL_YEAR_END,
  SCHOOL_YEAR_START,
} from "@/lib/schedule";
import * as ics from "ics";
import { NextResponse } from "next/server";

export async function GET() {
  const daysForYear: DailySchedule[] = [];

  const totalDays = SCHOOL_YEAR_END.diff(SCHOOL_YEAR_START, "days").days;

  for (let i = 0; i < totalDays; i++) {
    const day = SCHOOL_YEAR_START.plus({ days: i });
    daysForYear.push(getScheduleForDay(day));
  }

  const allPeriods = daysForYear.map((schedule) => schedule.periods).flat();

  const { error, value: events } = ics.createEvents(
    allPeriods
      .filter((period) => period.type !== "passing")
      .filter((period) => period.type === "instructional")
      .map((period) => {
        return {
          start: period.interval.start!.toMillis(),
          end: period.interval.end!.toMillis(),
          title: period.name,
          uid: crypto.randomUUID(),
        };
      }),
  );

  if (error) {
    throw new Error("Error creating iCal feed", { cause: error });
  }

  return new NextResponse(events, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="phs-schedule.ics"`,
    },
  });
}
