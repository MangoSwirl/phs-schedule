import { DailySchedule, transformScheduleToDate } from "@/lib/schedule";
import { DateTime, Interval } from "luxon";
import { redis } from ".";
import { z } from "zod";
import { emptyDay } from "@/lib/schedule-templates";

export const timeSchema = z.string().regex(/^[0-9]{2}:[0-9]{2}:[0-9]{2}$/);
export const intervalSchema = z.tuple([timeSchema, timeSchema]);
export const invisiblePeriodSchema = z.object({
  interval: intervalSchema,
  type: z.literal("passing"),
});
export const visiblePeriodSchema = z.object({
  interval: intervalSchema,
  id: z.string(),
  type: z.enum(["instructional", "break"]),
  name: z.string(),
});
export const periodSchema = z.union([
  invisiblePeriodSchema,
  visiblePeriodSchema,
]);
export const dailyScheduleSchema = z.object({
  periods: z.array(periodSchema),
  message: z.string().optional(),
});

function serializeSchedule(schedule: DailySchedule): string {
  const obj: z.infer<typeof dailyScheduleSchema> = {
    ...schedule,
    periods: schedule.periods.map((p) => ({
      ...p,
      interval: [
        p.interval.start!.toISOTime({
          suppressMilliseconds: true,
          includeOffset: false,
        }),
        p.interval.end!.toISOTime({
          suppressMilliseconds: true,
          includeOffset: false,
        }),
      ],
    })),
  };

  return JSON.stringify(obj);
}

function deserializeSchedule(str: any): DailySchedule {
  const obj = dailyScheduleSchema.parse(JSON.parse(str));

  return {
    ...obj,
    periods: obj.periods.map((p) => ({
      ...p,
      interval: Interval.fromDateTimes(
        DateTime.fromISO(p.interval[0]),
        DateTime.fromISO(p.interval[1]),
      ),
    })),
  };
}

export async function setDailySchedule(
  day: DateTime,
  schedule: DailySchedule | null,
): Promise<void> {
  if (schedule === null) {
    await redis.del(`day:${day.toISODate()}`);
  } else {
    await redis.set(`day:${day.toISODate()}`, serializeSchedule(schedule));
  }
}

export async function getDailySchedule(day: DateTime): Promise<DailySchedule> {
  const str = await redis.get(`day:${day.toISODate()}`);

  let schedule = emptyDay;

  if (str !== null) {
    schedule = deserializeSchedule(str);
  }

  return transformScheduleToDate(schedule, day);
}

export async function getScheduleForWeek(
  week: DateTime,
): Promise<(DailySchedule & { date: DateTime })[]> {
  const weekStart = week.startOf("week");

  const schedule: (DailySchedule & { date: DateTime })[] = [];

  for (let i = 0; i < 7; i++) {
    const day = weekStart.plus({ days: i });
    schedule.push({ ...(await getDailySchedule(day)), date: day });
  }

  return schedule;
}
