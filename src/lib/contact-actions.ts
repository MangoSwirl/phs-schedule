"use server";

import { z } from "zod";
import { feedbackFormSchema } from "../components/feedback-form";
import { env } from "@/env";
import { resend } from "@/lib/resend";
import { problemFormSchema } from "@/components/problem-form";

export async function onSubmitFeedback(
  data: z.infer<typeof feedbackFormSchema>,
) {
  const email = env.NOTIFICATION_EMAIL;

  await resend.emails.send({
    from: "PHS Schedule <no-reply@feedback.phs-schedule.com>",
    to: email,
    subject: "Feedback from PHS Schedule",
    text: `
      ${data.body}
    `,
  });
}

export async function onReportProblem(data: z.infer<typeof problemFormSchema>) {
  const email = env.NOTIFICATION_EMAIL;

  await resend.emails.send({
    from: "PHS Schedule <no-reply@feedback.phs-schedule.com>",
    to: email,
    subject: "Problem report from PHS Schedule",
    text: `
      ${data.body}
    `,
  });
}
