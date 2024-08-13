"use client";

import { Period, PortablePeriod, portableToInterval } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { useState, useEffect } from "react";

export function PeriodBlock({
  portablePeriod,
  temporalSizing,
}: {
  portablePeriod: PortablePeriod;
  temporalSizing?: boolean;
}) {
  const period: Period = {
    ...portablePeriod,
    interval: portableToInterval(portablePeriod.interval),
  };

  const [now, setNow] = useState(DateTime.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(DateTime.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const hasHappened = period.interval.isBefore(now);
  const isHappening = period.interval.contains(now);

  if (period.type === "passing")
    return (
      <div
        aria-hidden
        style={
          temporalSizing
            ? {
                flex: period.interval.length("minutes") / 10,
              }
            : {}
        }
        className={cn(!temporalSizing && "h-3")}
      />
    );

  return (
    <div
      className={cn(
        "flex min-h-11 flex-col items-stretch justify-center",
        period.type === "instructional" &&
          "rounded-md border border-neutral-200 shadow-sm",
        hasHappened && "opacity-50",
        isHappening && period.type === "instructional" && "bg-neutral-100",
      )}
      style={
        temporalSizing ? { flex: period.interval.length("minutes") / 10 } : {}
      }
    >
      <div
        className={cn(
          "flex flex-col items-start justify-center px-3 text-sm",
          period.type === "break" && "flex-row items-center gap-2",
          isHappening && period.type === "break" && "border-l-2 border-purple",
          !temporalSizing && "p-3",
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
