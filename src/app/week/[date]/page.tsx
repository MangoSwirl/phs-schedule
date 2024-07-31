import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Period,
  getScheduleForWeek,
  type VisiblePeriod,
  DailySchedule,
  transformScheduleToDate,
} from "@/lib/schedule";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DropdownMenuIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { DateTime } from "luxon";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FeedbackForm } from "@/components/feedback-form";
import { useState } from "react";
import InfoMenu from "./InfoMenu";

export default function Home({ params }: { params: { date: string } }) {
  // If the date is invalid, redirect to the current week
  if (!DateTime.fromFormat(params.date, "yyyy-LL-dd").isValid) {
    redirect(`/week`);
  }

  // If the date isn't the first day of the week, redirect to the first day of its week
  if (DateTime.fromFormat(params.date, "yyyy-LL-dd").weekday !== 1) {
    redirect(
      `/week/${DateTime.fromFormat(params.date, "yyyy-LL-dd")
        .startOf("week")
        .toFormat("yyyy-LL-dd")}`
    );
  }

  const weekStart = DateTime.fromFormat(params.date, "yyyy-LL-dd");

  const schedule = getScheduleForWeek(weekStart);
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
      <div className="h-screen flex flex-col justify-center">
        <WeekNav date={weekStart} />
        <main className="flex items-stretch justify-center flex-1 max-h-[800px]">
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
    <nav className="flex justify-center items-center gap-2">
      <Button variant="ghost" size="icon" asChild aria-label="Previous week">
        <Link
          href={`/week/${date.minus({ weeks: 1 }).toFormat("yyyy-LL-dd")}`}
          prefetch
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
      </Button>
      <h1 className="text-center text-neutral-600 min-w-[150px]">
        Week of{" "}
        <span className="font-medium text-neutral-900">
          {date.toFormat("LLLL d")}
        </span>
      </h1>
      <Button variant="ghost" size="icon" asChild aria-label="Next week">
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

function PeriodBlock({ period }: { period: Period }) {
  const hasHappened = period.interval.isBefore(DateTime.now());
  const isHappening = period.interval.contains(DateTime.now());

  if (period.type === "passing")
    return (
      <div
        aria-hidden
        style={{
          flex: period.interval.length("minutes") / 10,
        }}
      />
    );

  return (
    <div
      className={cn(
        "flex justify-center flex-col items-stretch min-h-11",
        period.type === "instructional" &&
          "border border-neutral-200 rounded-md shadow-sm",
        hasHappened && "opacity-50",
        isHappening && period.type === "instructional" && "bg-neutral-100"
      )}
      style={{
        flex: period.interval.length("minutes") / 10,
      }}
      // variant={
      //   (
      //     {
      //       instructional: "outline",
      //       break: "ghost",
      //     } as const
      //   )[period.type]
      // }
      // disabled={hasHappened}
    >
      <div
        className={cn(
          "flex flex-col items-start justify-center px-3 text-sm",
          period.type === "break" && "flex-row items-center gap-2",
          isHappening && period.type === "break" && "border-l-2 border-purple"
        )}
      >
        <h2 className="font-medium">{period.name}</h2>
        <p>
          {period.interval.start?.toFormat("h:mm")} -{" "}
          {period.interval.end?.toFormat("h:mm")}
        </p>
      </div>
    </div>
  );
}

function DailyScheduleView({
  schedule,
  date,
  minutesBeforeMax,
}: {
  schedule: DailySchedule;
  date: DateTime;
  minutesBeforeMax?: number;
}) {
  const { periods } = schedule;

  return (
    <div className="flex flex-col max-w-52 p-2 flex-1 justify-center">
      <div className="h-12 flex flex-col justify-center">
        {date && (
          <h2 className="text-center">
            {date.weekdayLong}{" "}
            <span className="text-neutral-500">{date.toFormat("M/d")}</span>
          </h2>
        )}
        {schedule.message && (
          <p className="text-sm text-center text-neutral-700">
            {schedule.message}
          </p>
        )}
      </div>
      <div className="flex flex-col flex-1 justify-center">
        {periods.map((period) => (
          <PeriodBlock period={period} key={period.interval.toString()} />
        ))}
        {periods.length > 0 && !!minutesBeforeMax && (
          <div style={{ flex: minutesBeforeMax / 10 }} aria-hidden />
        )}
        {periods.length === 0 && (
          <p className="text-center text-neutral-500">No school</p>
        )}
      </div>
    </div>
  );
}
