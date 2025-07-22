import { importCalendar } from "@/lib/import-calendar";
import { revalidateSchedulePages } from "@/lib/revalidation";
import { NextResponse } from "next/server";

export async function POST() {
  await importCalendar();

  // Revalidate all schedule-related pages
  revalidateSchedulePages();

  return new NextResponse();
}
