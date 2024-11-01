import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

export function CalendarSyncDialog() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add to calendar</DialogTitle>
        <DialogDescription>
          See your classes in your calendar app.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <CopyLinkButton link="https://www.phs-schedule.com/ical.ics" />
        <Button className="w-full" asChild>
          <Link href="webcal://www.phs-schedule.com/ical.ics" target="_blank">
            Subscribe to calendar
          </Link>
        </Button>
      </div>
    </>
  );
}

function CopyLinkButton(props: { link: string }) {
  const [isCopied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(props.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const iconClassName = "absolute right-3 ml-2 h-4 w-4";

  return (
    <>
      <Button
        variant="outline"
        className="relative flex w-full justify-start overflow-hidden px-3 py-1 pr-8 font-normal"
        onClick={onCopy}
      >
        <span className="sr-only">Copy link</span>
        <span className="flex-1 truncate text-start" aria-hidden="true">
          {props.link}
        </span>
        {isCopied ? (
          <CheckIcon className={iconClassName} />
        ) : (
          <CopyIcon className={iconClassName} />
        )}
      </Button>
      {isCopied && (
        <span className="sr-only" aria-live="polite" role="log">
          Link copied to clipboard
        </span>
      )}
    </>
  );
}
