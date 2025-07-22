import { revalidatePath } from "next/cache";
import { DateTime } from "luxon";

export function revalidateSchedulePages(date?: DateTime) {
  if (date) {
    // Revalidate specific day and week pages
    const dateStr = date.toFormat("yyyy-LL-dd");
    const weekStart = date.startOf("week").toFormat("yyyy-LL-dd");

    revalidatePath(`/day/${dateStr}`);
    revalidatePath(`/week/${weekStart}`);
  }

  // Always revalidate the base pages and dynamic routes
  revalidatePath("/day/[date]", "page");
  revalidatePath("/week/[date]", "page");
  revalidatePath("/day");
  revalidatePath("/week");
}
