import { DateTime } from "luxon";
import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to today
  redirect(`/day/${DateTime.now().toFormat("yyyy-LL-dd")}`);
}
