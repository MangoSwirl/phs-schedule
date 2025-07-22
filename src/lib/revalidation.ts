import { revalidatePath } from "next/cache";
import { DateTime } from "luxon";

export function revalidateSchedulePages(date: DateTime) {
  // Revalidate specific day and week pages
  const dateStr = date.toFormat("yyyy-LL-dd");
  const weekStart = date.startOf("week").toFormat("yyyy-LL-dd");

  revalidatePath(`/day/${dateStr}`);
  revalidatePath(`/week/${weekStart}`);
}
