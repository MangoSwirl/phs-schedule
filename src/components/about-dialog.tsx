"use client";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";

export function AboutDialog() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>About</DialogTitle>
        <DialogDescription className="space-y-2 pt-2 text-left">
          <p>
            Created by{" "}
            <Link
              href="https://github.com/MangoSwirl"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              MangoSwirl
            </Link>
          </p>
          <p>
            Maintained by{" "}
            <Link
              href="https://github.com/jackshim415"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              jackshim415
            </Link>
          </p>
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              Contributors
            </p>
            <ul className="mt-1 list-disc pl-5">
              <li>
                <Link
                  href="https://github.com/alouch1234"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  alouch1234
                </Link>
              </li>
            </ul>
          </div>
          <p className="pt-2 text-xs">
            <Link
              href="https://github.com/MangoSwirl/phs-schedule"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              View on GitHub
            </Link>
          </p>
        </DialogDescription>
      </DialogHeader>
    </>
  );
}
