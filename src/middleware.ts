import { NextResponse, userAgent } from "next/server";
import type { NextRequest } from "next/server";
import { DateTime } from "luxon";

export function middleware(request: NextRequest) {
  console.log(request.nextUrl.pathname);
  const { device } = userAgent(request);

  // Handle week route redirects for non-Monday dates
  const weekMatch = request.nextUrl.pathname.match(
    /^\/week\/(\d{4}-\d{2}-\d{2})$/,
  );
  if (weekMatch) {
    const dateStr = weekMatch[1];
    try {
      const date = DateTime.fromFormat(dateStr, "yyyy-LL-dd");

      if (date.isValid) {
        // If it's not a Monday, redirect to the Monday of that week
        if (date.weekday !== 1) {
          const monday = date.startOf("week");
          const mondayStr = monday.toFormat("yyyy-LL-dd");
          return NextResponse.redirect(
            new URL(`/week/${mondayStr}`, request.url),
          );
        }
      }
    } catch (error) {
      // Invalid date format - let Next.js handle the 404
    }
  }

  // Handle root route device-based redirects
  if (request.nextUrl.pathname === "/") {
    if (device.type === "mobile") {
      return NextResponse.redirect(new URL("/day", request.url));
    } else {
      return NextResponse.redirect(new URL("/week", request.url));
    }
  }
}

export const config = {
  matcher: ["/", "/week/:path*"],
};
