import InfoMenu from "@/components/InfoMenu";
import { PeriodBlock } from "@/components/PeriodBlock";
import { Button } from "@/components/ui/button";
import {
  intervalToPortable,
  SCHOOL_YEAR_START,
  SCHOOL_YEAR_END,
} from "@/lib/schedule";
import { getDailySchedule } from "@/redis/days";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DateTime } from "luxon";
import Link from "next/link";

export const revalidate = 7 * 24 * 60 * 60; // Revalidate every week
export const dynamicParams = true; // Allow any date - ISR will handle caching

export async function generateStaticParams() {
  const params = [];

  // Pre-generate routes for school year dates for optimal ISR performance
  // dynamicParams = true allows other dates to be generated on-demand
  let currentDate = SCHOOL_YEAR_START;

  while (currentDate <= SCHOOL_YEAR_END) {
    params.push({
      date: currentDate.toFormat("yyyy-LL-dd"),
    });
    currentDate = currentDate.plus({ days: 1 });
  }

  console.log(
    `Generated ${params.length} day params from ${SCHOOL_YEAR_START.toISODate()} to ${SCHOOL_YEAR_END.toISODate()}`,
  );
  return params;
}
export default async function DayView({
  params,
}: {
  params: { date: string };
}) {
  // Since dynamicParams = false, we can assume the date is valid and pre-generated
  const parsedDate = DateTime.fromFormat(params.date, "yyyy-LL-dd");

  const { periods, message } = await getDailySchedule(parsedDate);

  return (
    <div>
      <div className="sticky left-0 right-0 top-0 flex flex-col items-center bg-white/40 p-4 backdrop-blur-sm">
        <DayNav date={parsedDate} />
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
