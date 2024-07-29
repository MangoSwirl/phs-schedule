import { DateTime } from "luxon";
import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to the current week
  redirect(`/week/${DateTime.now().toFormat("yyyy-LL-dd")}`);
}
