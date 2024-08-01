const instructionalPeriods = ["1", "2", "3", "4", "5", "6", "7"] as const;

type InstructionalPeriod = (typeof instructionalPeriods)[number];

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-screen-md px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">My Courses</h1>
      <p className="text-neutral-700">
        Enter your courses to display them in your schedule.
      </p>
    </main>
  );
}
