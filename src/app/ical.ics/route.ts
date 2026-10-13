import {
  DailySchedule,
  getScheduleForDay,
  SCHOOL_YEAR_END,
  SCHOOL_YEAR_START,
} from "@/lib/schedule";
import * as ics from "ics";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  periods: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  one: z.string().optional(),
  two: z.string().optional(),
  three: z.string().optional(),
  four: z.string().optional(),
  five: z.string().optional(),
  six: z.string().optional(),
  seven: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const params = querySchema.parse({
    periods: searchParams.get("periods") ?? undefined,
    one: searchParams.get("one") ?? undefined,
    two: searchParams.get("two") ?? undefined,
    three: searchParams.get("three") ?? undefined,
    four: searchParams.get("four") ?? undefined,
    five: searchParams.get("five") ?? undefined,
    six: searchParams.get("six") ?? undefined,
    seven: searchParams.get("seven") ?? undefined,
  });

  const { periods, one, two, three, four, five, six, seven } = params;

  const remapPeriods: Record<string, string> = {
    "1st Period": `① ${one ?? "Period"}`,
    "2nd Period": `② ${two ?? "Period"}`,
    "3rd Period": `③ ${three ?? "Period"}`,
    "4th Period": `④ ${four ?? "Period"}`,
    "5th Period": `⑤ ${five ?? "Period"}`,
    "6th Period": `⑥ ${six ?? "Period"}`,
    "7th Period": `⑦ ${seven ?? "Period"}`,
  };

  const daysForYear: DailySchedule[] = [];

  const totalDays = SCHOOL_YEAR_END.diff(SCHOOL_YEAR_START, "days").days + 1;

  for (let i = 0; i < totalDays; i++) {
    const day = SCHOOL_YEAR_START.plus({ days: i });
    daysForYear.push(await getScheduleForDay(day));
  }

  const allPeriods = daysForYear.map((schedule) => schedule.periods).flat();

  const { error, value: events } = ics.createEvents(
    allPeriods
      .filter((period) => period.type === "instructional")
      .map((period) => {
        if (!("name" in period) || typeof period.name !== "string") {
          throw new Error("Instructional periods must have a name");
        }

        const periodName = period.name;
        return {
          start: period.interval.start!.toMillis(),
          end: period.interval.end!.toMillis(),
          title: periods
            ? (remapPeriods[periodName] ?? periodName)
            : periodName,
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
