"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuthSession } from "@/lib/auth";
import { requireAuthSessionWithPlan } from "@/lib/subscription";
import {
  createEventFromTemplate,
  saveTemplate,
} from "@/lib/services/templates-service";

export async function saveTemplateFromEventAction(
  input: Omit<Parameters<typeof saveTemplate>[0], "userId" | "plan">,
) {
  const template = await saveTemplateForCurrentUser({
    ...input,
  });

  revalidatePath("/templates");
  return template;
}

function resolveTheme(value: FormDataEntryValue | null) {
  return value === "dark" ? "dark" : "light";
}

export async function saveTemplateFromEventFormAction(formData: FormData) {
  const sourceEventId = String(formData.get("sourceEventId") ?? "");
  const name = String(formData.get("name") ?? "");
  const descriptionValue = formData.get("description");
  await saveTemplateForCurrentUser({
    sourceEventId,
    name,
    description:
      typeof descriptionValue === "string" ? descriptionValue : undefined,
  });

  redirect("/templates");
}

async function createEventFromTemplateForCurrentUser(
  input: Omit<Parameters<typeof createEventFromTemplate>[0], "userId">,
) {
  const session = await requireAuthSession();

  return createEventFromTemplate({
    ...input,
    userId: session.user.id,
  });
}

async function saveTemplateForCurrentUser(
  input: Omit<Parameters<typeof saveTemplate>[0], "userId" | "plan">,
) {
  const { session, currentPlan } = await requireAuthSessionWithPlan();

  return saveTemplate({
    ...input,
    userId: session.user.id,
    plan: currentPlan.plan,
  });
}

export async function createEventFromTemplateAction(
  input: Omit<Parameters<typeof createEventFromTemplate>[0], "userId">,
) {
  const event = await createEventFromTemplateForCurrentUser(input);

  revalidatePath("/templates");
  return event;
}

export async function createEventFromTemplateFormAction(formData: FormData) {
  const templateId = String(formData.get("templateId") ?? "");
  const title = String(formData.get("title") ?? "");
  const theme = resolveTheme(formData.get("theme"));
  const event = await createEventFromTemplateForCurrentUser({
    templateId,
    title,
  });

  revalidatePath("/templates");
  redirect(`/events/${event.id}?theme=${theme}`);
}
