import InfoMenu from "@/components/InfoMenu";
import { PeriodBlock } from "@/components/PeriodBlock";
import { Button } from "@/components/ui/button";
import { getScheduleForDay, intervalToPortable } from "@/lib/schedule";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DateTime } from "luxon";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function DayView({ params }: { params: { date: string } }) {
  // If the date is invalid, redirect to the current day
  if (!DateTime.fromFormat(params.date, "yyyy-LL-dd").isValid) {
    redirect(`/day`);
  }

  const date = DateTime.fromFormat(params.date, "yyyy-LL-dd");

  const { periods, message } = getScheduleForDay(date);

  return (
    <div>
      <div className="sticky left-0 right-0 top-0 flex flex-col items-center bg-white/40 p-4 backdrop-blur-sm">
        <DayNav date={date} />
        {message && <p className="text-center text-neutral-700">{message}</p>}
      </div>
      <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-8 pb-8">
        {periods.map((period) => (
          <PeriodBlock
            portablePeriod={{
              ...period,
              interval: intervalToPortable(period.interval),
            }}
            key={period.interval.toString()}
          />
        ))}
        {periods.length === 0 && (
          <p className="text-center text-neutral-500">No school</p>
        )}
      </div>
      <InfoMenu />
    </div>
  );
}

function DayNav({ date }: { date: DateTime }) {
  return (
    <nav className="flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="icon"
        asChild
        aria-label="Yesterday"
        className="print:hidden"
      >
        <Link
          href={`/day/${date.minus({ days: 1 }).toFormat("yyyy-LL-dd")}`}
          prefetch
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
      </Button>
      <h1 className="min-w-[10rem] text-center font-medium text-neutral-900">
        {date.toFormat("EEEE, LLLL d")}
      </h1>
      <Button
        variant="ghost"
        size="icon"
        asChild
        aria-label="Tomorrow"
        className="print:hidden"
      >
        <Link
          href={`/day/${date.plus({ days: 1 }).toFormat("yyyy-LL-dd")}`}
          prefetch
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
