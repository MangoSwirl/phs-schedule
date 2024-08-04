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
import { useEffect, useTransition } from "react";
import { toast } from "sonner";
import { onReportProblem } from "@/lib/contact-actions";

export const problemFormSchema = z.object({
  body: z
    .string()
    .min(1, "Please enter a description.")
    .max(1000, "Please shorten your description."),
});

export function ProblemForm(props: { onSuccess: () => void }) {
  const form = useForm<z.infer<typeof problemFormSchema>>({
    defaultValues: {
      body: "",
    },
    resolver: zodResolver(problemFormSchema),
  });

  const [isPending, startTransition] = useTransition();

  const { setFocus } = form;
  useEffect(() => {
    setTimeout(() => setFocus("body"), 10);
  }, [setFocus]);

  const onSuccess = () => {
    console.log("success");
    toast.success("Thanks for your report.");
    props.onSuccess();
    form.reset();
  };

  const onSubmit = (data: z.infer<typeof problemFormSchema>) => {
    startTransition(() => onReportProblem(data).then(onSuccess));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="off"
      >
        <DialogHeader>
          <DialogTitle>Report a problem</DialogTitle>
        </DialogHeader>
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{"What's the problem?"}</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us what's wrong..." {...field} />
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
