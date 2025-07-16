import { importCalendar } from "@/lib/import-calendar";
import { NextResponse } from "next/server";

export async function POST() {
  await importCalendar();

  return new NextResponse();
}
