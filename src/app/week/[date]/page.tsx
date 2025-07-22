import { Button } from "@/components/ui/button";
import {
  type VisiblePeriod,
  DailySchedule,
  transformScheduleToDate,
  intervalToPortable,
  SCHOOL_YEAR_START,
  SCHOOL_YEAR_END,
} from "@/lib/schedule";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DateTime } from "luxon";
import Link from "next/link";
import InfoMenu from "@/components/InfoMenu";
import { PeriodBlock } from "../../../components/PeriodBlock";
import { getScheduleForWeek } from "@/redis/days";
import { notFound } from "next/navigation";

export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow any date - ISR will handle caching

export async function generateStaticParams() {
  const params = [];

  // Pre-generate Monday dates for school year for optimal ISR performance
  // dynamicParams = true allows other dates to be generated on-demand
  let current = SCHOOL_YEAR_START.startOf("week"); // Get Monday of first week
  const end = SCHOOL_YEAR_END.startOf("week").plus({ weeks: 2 }); // Go a bit past end

  while (current <= end) {
    params.push({
      date: current.toFormat("yyyy-LL-dd"),
    });
    current = current.plus({ weeks: 1 }); // Move to next Monday
  }

  console.log(
    `Generated ${params.length} week params from ${SCHOOL_YEAR_START.startOf("week").toISODate()} to ${end.toISODate()}`,
  );
  return params;
}

export default async function WeekView({
  params,
}: {
  params: { date: string };
}) {
  // Validate the date format and return 404 for invalid dates
  const weekStart = DateTime.fromFormat(params.date, "yyyy-LL-dd");

  if (!weekStart.isValid) {
    notFound();
  }

  const schedule = await getScheduleForWeek(weekStart);
  let latestDismissal: DateTime | null = weekStart.set({
    hour: 14,
    minute: 30,
  });

  for (const daySchedule of schedule) {
    const { periods } = transformScheduleToDate(daySchedule, weekStart);

    const dismissalTime = periods[periods.length - 1]?.interval?.end ?? null;

    if (
      !latestDismissal ||
      (dismissalTime && dismissalTime > latestDismissal)
    ) {
      latestDismissal = dismissalTime;
    }
  }

  return (
    <>
      <div className="flex h-screen flex-col justify-center">
        <WeekNav date={weekStart} />
        <main className="flex max-h-[800px] flex-1 items-stretch justify-center">
          {schedule.map((schedule) => {
            const { date, periods } = schedule;

            if (periods.length === 0 && date.isWeekend) {
              return null;
            }

            const visiblePeriods: VisiblePeriod[] = [];

            for (const period of periods) {
              if (period.type !== "passing") {
                visiblePeriods.push(period);
              }
            }

            const dismissal = transformScheduleToDate(schedule, weekStart)
              .periods[periods.length - 1]?.interval?.end;

            const minutesBeforeMax =
              dismissal && latestDismissal
                ? latestDismissal?.diff(dismissal, "minutes").minutes
                : undefined;

            return (
              <DailyScheduleView
                schedule={schedule}
                date={date}
                key={date.weekday}
                minutesBeforeMax={minutesBeforeMax}
                temporalSizing
              />
            );
          })}
        </main>
      </div>
      <InfoMenu />
    </>
  );
}

function WeekNav({ date }: { date: DateTime }) {
  return (
    <nav className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        asChild
        aria-label="Previous week"
        className="print:hidden"
      >
        <Link
          href={`/week/${date.minus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`}
          prefetch
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
      </Button>
      <h1 className="min-w-[150px] text-center text-neutral-600">
        Week of{" "}
        <span className="font-medium text-neutral-900">
          {date.toFormat("LLLL d")}
        </span>
      </h1>
      <Button
        variant="ghost"
        size="icon"
        asChild
        aria-label="Next week"
        className="print:hidden"
      >
        <Link
          href={`/week/${date.plus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`}
          prefetch
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}

function DailyScheduleView({
  schedule,
  date,
  minutesBeforeMax,
  temporalSizing,
}: {
  schedule: DailySchedule;
  date: DateTime;
  minutesBeforeMax?: number;
  temporalSizing?: boolean;
}) {
  const { periods } = schedule;

  return (
    <div className="flex max-w-52 flex-1 flex-col justify-center p-2">
      <div className="flex h-12 flex-col justify-center">
        {date && (
          <h2 className="text-center">
            {date.weekdayLong}{" "}
            <span className="text-neutral-500">{date.toFormat("M/d")}</span>
          </h2>
        )}
        {schedule.message && (
          <p className="text-center text-sm text-neutral-700">
            {schedule.message}
          </p>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center">
        {periods.map((period) => (
          <PeriodBlock
            portablePeriod={{
              ...period,
              interval: intervalToPortable(period.interval),
            }}
            key={period.interval.toString()}
            temporalSizing={temporalSizing}
          />
        ))}
        {temporalSizing && periods.length > 0 && !!minutesBeforeMax && (
          <div style={{ flex: minutesBeforeMax / 10 }} aria-hidden />
        )}
        {periods.length === 0 && (
          <p className="text-center text-neutral-500">No school</p>
        )}
      </div>
    </div>
  );
}
