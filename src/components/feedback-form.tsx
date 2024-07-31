"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { onSubmitFeedback } from "../lib/contact-actions";
import { useTransition } from "react";
import { toast } from "sonner";

export const feedbackFormSchema = z.object({
  body: z
    .string()
    .min(1, "Please enter a comment.")
    .max(1000, "Please shorten your comment."),
});

export function FeedbackForm(props: { onSuccess: () => void }) {
  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    defaultValues: {
      body: "",
    },
    resolver: zodResolver(feedbackFormSchema),
  });

  const [isPending, startTransition] = useTransition();

  const onSuccess = () => {
    console.log("success");
    toast.success("Thanks for your feedback!");
    props.onSuccess();
    form.reset();
  };

  const onSubmit = (data: z.infer<typeof feedbackFormSchema>) => {
    startTransition(() => onSubmitFeedback(data).then(onSuccess));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="off"
      >
        <DialogHeader>
          <DialogTitle>Share your feedback</DialogTitle>
        </DialogHeader>
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"What's on your mind?"}</FormLabel>
              <FormControl>
                <Textarea placeholder="It would be helpful if..." {...field} />
              </FormControl>
              <FormDescription>
                Feel free to leave a reply email if you&apos;d like any updates.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" loading={isPending}>
            Submit
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
