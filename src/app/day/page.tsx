import { DateTime } from "luxon";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default function Page() {
  // Redirect to today
  redirect(`/day/${DateTime.now().toFormat("yyyy-LL-dd")}`);
}
