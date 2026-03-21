"use server";

import { revalidatePath } from "next/cache";
import { requireAuthSession } from "@/lib/auth";
import { requireAuthSessionWithPlan } from "@/lib/subscription";
import {
  createEventFromTemplate,
  saveTemplate,
} from "@/lib/services/templates-service";

export async function saveTemplateFromEventAction(
  input: Omit<Parameters<typeof saveTemplate>[0], "userId" | "plan">,
) {
  const { session, currentPlan } = await requireAuthSessionWithPlan();
  const template = await saveTemplate({
    ...input,
    userId: session.user.id,
    plan: currentPlan.plan,
  });

  revalidatePath("/templates");
  return template;
}

export async function saveTemplateFromEventFormAction(formData: FormData) {
  const sourceEventId = String(formData.get("sourceEventId") ?? "");
  const name = String(formData.get("name") ?? "");
  const descriptionValue = formData.get("description");

  await saveTemplateFromEventAction({
    sourceEventId,
    name,
    description:
      typeof descriptionValue === "string" ? descriptionValue : undefined,
  });
}

export async function createEventFromTemplateAction(
  input: Omit<Parameters<typeof createEventFromTemplate>[0], "userId">,
) {
  const session = await requireAuthSession();
  const event = await createEventFromTemplate({
    ...input,
    userId: session.user.id,
  });

  revalidatePath("/templates");
  return event;
}
