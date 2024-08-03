"use client";

import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverAnchor } from "@radix-ui/react-popover";
import { CommandEmpty, CommandItem, Command as CommandPrimitive } from "cmdk";
import { useEffect, useRef, useState } from "react";

const instructionalPeriods = ["1", "2", "3", "4", "5", "6", "7"] as const;

type InstructionalPeriod = (typeof instructionalPeriods)[number];

export default function CoursesPage() {
  return (
    <main className="mx-auto max-w-screen-md px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">My Courses</h1>
      <p className="text-neutral-700">
        Enter your courses to display them in your schedule.
      </p>
      <CourseSelector period="1" />
    </main>
  );
}

function CourseSelector(props: { period: InstructionalPeriod }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchQuery.length > 0) {
      setPopoverOpen(true);
    } else {
      setPopoverOpen(false);
    }
  }, [searchQuery]);

  return (
    <Command>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={false}>
        <PopoverAnchor>
          <CommandPrimitive.Input asChild>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CommandPrimitive.Input>
        </PopoverAnchor>
        <PopoverContent>
          <CommandList>
            <CommandEmpty>No courses found</CommandEmpty>
            <CommandItem>Course 1</CommandItem>
            <CommandItem>Course 2</CommandItem>
            <CommandItem>Course 3</CommandItem>
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  );
}
