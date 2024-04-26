import { Interval, DateTime, WeekdayNumbers } from "luxon";

type Period = {
    interval: Interval;
} & (
        | {
            type: "instructional" | "break";
            id: string;
            name: string;
        }
        | {
            type: "passing";
        }
    );

export const mondaySchedule: Period[] = [
    {
        id: "period-1",
        type: "instructional",
        name: "1st Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO('08:30:00-07:00'),
            DateTime.fromISO("09:15:00-07:00"),
        ),
    },
    {
        type: "passing",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("09:15:00-07:00"),
            DateTime.fromISO("09:20:00-07:00"),
        ),
    },
    {
        id: "period-2",
        type: "instructional",
        name: "2nd Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("09:25:00-07:00"),
            DateTime.fromISO("10:10:00-07:00"),
        ),
    },
    {
        id: "brunch",
        type: "break",
        name: "Brunch",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("10:10:00-07:00"),
            DateTime.fromISO("10:25:00-07:00"),
        ),
    },
    {
        id: "period-3",
        type: "instructional",
        name: "3rd Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("10:25:00-07:00"),
            DateTime.fromISO("11:10:00-07:00"),
        ),
    },
    {
        type: "passing",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("11:10:00-07:00"),
            DateTime.fromISO("11:20:00-07:00"),
        ),
    },
    {
        id: "period-4",
        type: "instructional",
        name: "4th Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("11:20:00-07:00"),
            DateTime.fromISO("12:10:00-07:00"),
        ),
    },
    {
        type: "passing",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("12:10:00-07:00"),
            DateTime.fromISO("12:20:00-07:00"),
        ),
    },
    {
        id: "period-5",
        type: "instructional",
        name: "5th Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("12:20:00-07:00"),
            DateTime.fromISO("13:05:00-07:00"),
        ),
    },
    {
        id: "lunch",
        type: "break",
        name: "Lunch",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("13:05:00-07:00"),
            DateTime.fromISO("13:45:00-07:00"),
        ),
    },
    {
        id: "period-6",
        type: "instructional",
        name: "6th Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("13:45:00-07:00"),
            DateTime.fromISO("14:30:00-07:00"),
        ),
    },
    {
        type: "passing",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("14:30:00-07:00"),
            DateTime.fromISO("14:40:00-07:00"),
        ),
    },
    {
        id: "period-7",
        type: "instructional",
        name: "7th Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("14:40:00-07:00"),
            DateTime.fromISO("15:25:00-07:00"),
        ),
    },
];

export const oddSchedule: Period[] = [
    {
        id: "period-1",
        type: "instructional",
        name: "1st Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("08:30:00-07:00"),
            DateTime.fromISO("10:00:00-07:00"),
        ),
    },
    {
        id: "brunch",
        type: "break",
        name: "Brunch",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("10:00:00-07:00"),
            DateTime.fromISO("10:15:00-07:00"),
        ),
    },
    {
        id: "period-3",
        type: "instructional",
        name: "3rd Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("10:15:00-07:00"),
            DateTime.fromISO("11:45:00-07:00"),
        ),
    },
    {
        type: "passing",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("11:45:00-07:00"),
            DateTime.fromISO("11:55:00-07:00"),
        ),
    },
    {
        id: "period-5",
        type: "instructional",
        name: "5th Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("11:55:00-07:00"),
            DateTime.fromISO("13:25:00-07:00"),
        ),
    },
    {
        id: "lunch",
        type: "break",
        name: "Lunch",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("13:25:00-07:00"),
            DateTime.fromISO("14:05:00-07:00"),
        ),
    },
    {
        id: "period-7",
        type: "instructional",
        name: "7th Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("14:05:00-07:00"),
            DateTime.fromISO("15:35:00-07:00"),
        ),
    },
];

export const evenSchedule: Period[] = [
    {
        id: "period-2",
        type: "instructional",
        name: "2nd Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("08:30:00-07:00"),
            DateTime.fromISO("10:00:00-07:00"),
        ),
    },
    {
        id: "brunch",
        type: "break",
        name: "Brunch",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("10:00:00-07:00"),
            DateTime.fromISO("10:15:00-07:00"),
        ),
    },
    {
        id: "academy",
        type: "instructional",
        name: "Academy",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("10:15:00-07:00"),
            DateTime.fromISO("11:00:00-07:00"),
        ),
    },
    {
        type: "passing",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("11:00:00-07:00"),
            DateTime.fromISO("11:10:00-07:00"),
        ),
    },
    {
        id: "period-4",
        type: "instructional",
        name: "4th Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("11:10:00-07:00"),
            DateTime.fromISO("12:40:00-07:00"),
        ),
    },
    {
        id: "lunch",
        type: "break",
        name: "Lunch",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("12:40:00-07:00"),
            DateTime.fromISO("13:20:00-07:00"),
        ),
    },
    {
        id: "period-6",
        type: "instructional",
        name: "6th Period",
        interval: Interval.fromDateTimes(
            DateTime.fromISO("13:20:00-07:00"),
            DateTime.fromISO("14:50:00-07:00"),
        ),
    },
];

export const schedule: Record<WeekdayNumbers, Period[]> = {
    1: [],
    2: mondaySchedule,
    3: oddSchedule,
    4: evenSchedule,
    5: oddSchedule,
    6: evenSchedule,
    7: [],
};
