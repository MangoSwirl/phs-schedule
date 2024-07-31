"use client";

import { FeedbackForm } from "@/components/feedback-form";
import { ProblemForm } from "@/components/problem-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export default function InfoMenu() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"feedback" | "problem">(
    "feedback",
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <div className="absolute right-2 top-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <DotsVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuItem>Add my classes</DropdownMenuItem>
            <DropdownMenuItem>Add to calendar</DropdownMenuItem>

            <DropdownMenuSeparator /> */}

            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setDialogType("feedback")}>
                Feedback
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogTrigger asChild>
              <DropdownMenuItem onClick={() => setDialogType("problem")}>
                Report a problem
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DialogContent>
        {dialogType === "feedback" && (
          <FeedbackForm onSuccess={() => setDialogOpen(false)} />
        )}
        {dialogType === "problem" && (
          <ProblemForm onSuccess={() => setDialogOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
