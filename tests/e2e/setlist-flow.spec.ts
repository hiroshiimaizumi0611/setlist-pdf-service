import { eq } from "drizzle-orm";
import { expect, test } from "playwright/test";
import { db, dbReady } from "../../lib/db/client";
import { subscription, user } from "../../lib/db/schema";
import { createEvent } from "../../lib/services/events-service";

test.describe.configure({ mode: "serial" });
test.setTimeout(120_000);

function uniqueCredentials(prefix: string) {
  const token = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `${token}@example.com`,
    password: "correct horse battery staple",
    name: token,
  };
}

async function registerAndLogin(page: import("playwright/test").Page, credentials: ReturnType<typeof uniqueCredentials>) {
  await page.goto("/register");
  const appOrigin = new URL(page.url()).origin;
  await expect(page.getByRole("heading", { name: "アカウントを作成" })).toBeVisible();
  await expect(page.getByLabel("名前")).toBeVisible();
  await expect(page.getByLabel("メールアドレス")).toBeVisible();
  await expect(page.getByLabel("パスワード")).toBeVisible();

  const signUpResponse = await page.context().request.post(
    `${appOrigin}/api/auth/sign-up/email`,
    {
      headers: {
        "content-type": "application/json",
        origin: appOrigin,
      },
      data: {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      },
    },
  );

  expect(signUpResponse.ok()).toBe(true);

  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("メールアドレス").fill(credentials.email);
  await page.getByLabel("パスワード").fill(credentials.password);
  await page.getByRole("button", { name: "ログイン" }).click();
  await expect(page).toHaveURL(/\/events$/, { timeout: 30_000 });
}

async function seedProSubscription(email: string) {
  await dbReady;

  const [owner] = await db.select().from(user).where(eq(user.email, email)).limit(1);

  if (!owner) {
    throw new Error(`User not found for ${email}`);
  }

  await db.insert(subscription).values({
    id: crypto.randomUUID(),
    plan: "pro",
    referenceId: owner.id,
    status: "active",
    billingInterval: "month",
    seats: 1,
    periodStart: new Date("2026-03-01T00:00:00.000Z"),
    periodEnd: new Date("2026-04-01T00:00:00.000Z"),
  });
}

async function seedEventWithSong(email: string, theme: "light" | "dark") {
  await dbReady;

  const [owner] = await db.select().from(user).where(eq(user.email, email)).limit(1);

  if (!owner) {
    throw new Error(`User not found for ${email}`);
  }

  const event = await createEvent({
    userId: owner.id,
    title: "E2E opener",
    venue: "RADHALL",
    eventDate: new Date("2026-03-28T09:00:00.000Z"),
    notes: "Seeded from the preset flow test",
    theme,
    items: [
      {
        itemType: "song",
        title: "E2E opener",
      },
    ],
  });

  return event.id;
}

async function expectEmbeddedPageNumbers(
  previewPage: import("playwright/test").Page,
  pageCount: number,
) {
  const embeddedPageNumbers = previewPage
    .frameLocator('iframe[title="紙面プレビュー"]')
    .locator("[data-pdf-page-number]");

  await expect(embeddedPageNumbers).toHaveCount(pageCount);
  await expect(embeddedPageNumbers).toHaveText(
    Array.from({ length: pageCount }, (_, index) => `${index + 1} / ${pageCount}`),
  );
}

test("supports the free-tier event flow, preview export, duplication, and upgrade", async ({
  page,
}) => {
  const credentials = uniqueCredentials("free-flow");

  await registerAndLogin(page, credentials);
  const currentTheme = "dark" as const;
  const currentEventId = await seedEventWithSong(credentials.email, currentTheme);

  await page.goto(`/events/${currentEventId}?theme=${currentTheme}`);

  await expect(page.locator('[data-editor-strip="metadata"]')).toBeVisible();
  await expect(page.locator('[data-editor-strip="add-item"]')).toBeVisible();
  await expect(page.locator('[data-row-variant="song"]').first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(
    page.locator('[data-row-variant="song"] [data-row-cue="song"]').first(),
  ).toHaveText("M01", { timeout: 10_000 });
  await expect(
    page.locator('[data-row-variant="song"] [data-row-title="song"]').first(),
  ).toHaveText("E2E opener", { timeout: 10_000 });

  const pdfButton = page.getByRole("button", { name: "PDF出力" });

  const editorUrlBeforePreview = page.url();
  await pdfButton.evaluate((button) => {
    (button as HTMLButtonElement).click();
  });

  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(
    new RegExp(`/events/${currentEventId}/pdf\\?theme=${currentTheme}$`),
  );
  await expect(page.getByRole("region", { name: "紙面プレビュー" })).toBeVisible();
  await expect(page.getByRole("complementary")).toBeVisible();
  await expect(page.getByText("PDF出力プリセット")).toBeVisible();
  await expect(page.getByText("PDFテーマ切替")).toBeVisible();
  await expect(page.getByText("出力サイズ選択")).toBeVisible();
  await expect(page.getByText("ページ継続確認")).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: currentTheme === "dark" ? "DARK" : "LIGHT",
      exact: true,
    }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Standard Dark" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("link", { name: "Standard Dark" })).toHaveAttribute(
    "href",
    `/events/${currentEventId}/pdf?theme=${currentTheme}&preset=standard-dark`,
  );
  await expect(page.getByRole("link", { name: "Large Type" })).toBeVisible();

  const pageCountBadge = page.getByText(/^[0-9]+ pages$/);
  await expect(pageCountBadge).toBeVisible();
  const pageCountText = (await pageCountBadge.textContent()) ?? "";
  const pageCount = Number.parseInt(pageCountText, 10);

  expect(Number.isNaN(pageCount)).toBe(false);

  await expectEmbeddedPageNumbers(page, pageCount);

  const embeddedDocument = page.locator('iframe[title="紙面プレビュー"]');
  const embeddedDocumentHref = await embeddedDocument.getAttribute("src");

  if (!embeddedDocumentHref) {
    throw new Error("Embedded document URL is missing from the preview page.");
  }

  const embeddedDocumentUrl = new URL(embeddedDocumentHref);

  expect(embeddedDocumentUrl.pathname).toBe(`/events/${currentEventId}/pdf/document`);
  expect(embeddedDocumentUrl.searchParams.get("theme")).toBe(currentTheme);
  await expect(
    page
      .frameLocator('iframe[title="紙面プレビュー"]')
      .locator("[data-pdf-document]"),
  ).toHaveAttribute("data-theme", currentTheme);

  const previewPdfLink = page.getByRole("link", { name: "PDF出力" });
  await expect(previewPdfLink).toHaveAttribute(
    "href",
    new RegExp(`^/api/events/${currentEventId}/pdf\\?theme=${currentTheme}&preset=standard-dark$`),
  );
  const pdfHref = await previewPdfLink.getAttribute("href");

  if (!pdfHref) {
    throw new Error("PDF export link is missing from the preview page.");
  }

  const previewDownloadUrl = new URL(pdfHref, page.url());
  expect(previewDownloadUrl.pathname).toBe(`/api/events/${currentEventId}/pdf`);
  expect(previewDownloadUrl.searchParams.get("theme")).toBe(currentTheme);
  expect(previewDownloadUrl.searchParams.get("preset")).toBe("standard-dark");
  expect(previewDownloadUrl.searchParams.get("theme")).toBe(
    embeddedDocumentUrl.searchParams.get("theme"),
  );

  await page.getByRole("link", { name: "Large Type" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/events/${currentEventId}/pdf\\?theme=${currentTheme}&preset=large-type$`),
  );
  await expect(page.getByText("Upgrade to unlock")).toBeVisible();
  await expect(page.getByRole("link", { name: "Proへアップグレード" })).toHaveAttribute(
    "href",
    "/settings/billing",
  );
  await expect(page.getByRole("link", { name: "Large Type" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("link", { name: "PDF出力" })).toHaveAttribute(
    "href",
    `/api/events/${currentEventId}/pdf?theme=${currentTheme}&preset=standard-dark`,
  );
  await expect(
    page.locator('iframe[title="紙面プレビュー"]'),
  ).toHaveAttribute("src", /\/events\/.+\/pdf\/document\?/);
  const blockedEmbeddedDocumentHref = await page
    .locator('iframe[title="紙面プレビュー"]')
    .getAttribute("src");

  if (!blockedEmbeddedDocumentHref) {
    throw new Error("Embedded document URL is missing after requesting a blocked preset.");
  }

  const blockedEmbeddedDocumentUrl = new URL(blockedEmbeddedDocumentHref, page.url());
  expect(blockedEmbeddedDocumentUrl.pathname).toBe(
    `/events/${currentEventId}/pdf/document`,
  );
  expect(blockedEmbeddedDocumentUrl.searchParams.get("theme")).toBe(currentTheme);
  expect(blockedEmbeddedDocumentUrl.searchParams.get("preset")).toBe("standard-dark");

  const alternateTheme = currentTheme === "dark" ? "light" : "dark";
  const alternateThemeLabel = alternateTheme === "dark" ? "DARK" : "LIGHT";

  await page.getByRole("link", { name: alternateThemeLabel, exact: true }).click();
  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(
    new RegExp(`/events/${currentEventId}/pdf\\?theme=${alternateTheme}&preset=large-type$`),
  );
  await expect(
    page.getByRole("link", { name: alternateThemeLabel, exact: true }),
  ).toHaveAttribute("aria-current", "page");

  const switchedEmbeddedDocumentHref = await embeddedDocument.getAttribute("src");

  if (!switchedEmbeddedDocumentHref) {
    throw new Error("Embedded document URL is missing after switching preview theme.");
  }

  const switchedEmbeddedDocumentUrl = new URL(switchedEmbeddedDocumentHref);

  expect(switchedEmbeddedDocumentUrl.pathname).toBe(`/events/${currentEventId}/pdf/document`);
  expect(switchedEmbeddedDocumentUrl.searchParams.get("theme")).toBe(alternateTheme);
  await expect(
    page
      .frameLocator('iframe[title="紙面プレビュー"]')
      .locator("[data-pdf-document]"),
  ).toHaveAttribute("data-theme", alternateTheme);
  await expect(
    page
      .frameLocator('iframe[title="紙面プレビュー"]')
      .locator("[data-pdf-document]"),
  ).toHaveAttribute("data-output-preset", "standard-light");
  await expectEmbeddedPageNumbers(page, pageCount);
  await expect(page.getByText("PDF出力プリセット")).toBeVisible();
  await expect(page.getByRole("link", { name: "Large Type" })).toHaveAttribute(
    "href",
    `/events/${currentEventId}/pdf?theme=${alternateTheme}&preset=large-type`,
  );
  await expect(page.getByRole("link", { name: "Standard Dark" })).toHaveAttribute(
    "href",
    `/events/${currentEventId}/pdf?theme=${alternateTheme}&preset=standard-dark`,
  );
  await expect(page.getByRole("link", { name: "PDF出力" })).toHaveAttribute(
    "href",
    `/api/events/${currentEventId}/pdf?theme=${alternateTheme}&preset=standard-light`,
  );
  expect(switchedEmbeddedDocumentUrl.searchParams.get("preset")).toBe("standard-light");

  await expect(previewPdfLink).toHaveAttribute(
    "href",
    new RegExp(`^/api/events/${currentEventId}/pdf\\?theme=${alternateTheme}&preset=standard-light$`),
  );
  const switchedPdfHref = await previewPdfLink.getAttribute("href");

  if (!switchedPdfHref) {
    throw new Error("PDF export link is missing after switching preview theme.");
  }

  const switchedPreviewDownloadUrl = new URL(switchedPdfHref, page.url());
  expect(switchedPreviewDownloadUrl.pathname).toBe(`/api/events/${currentEventId}/pdf`);
  expect(switchedPreviewDownloadUrl.searchParams.get("theme")).toBe(alternateTheme);
  expect(switchedPreviewDownloadUrl.searchParams.get("preset")).toBe("standard-light");
  expect(switchedPreviewDownloadUrl.searchParams.get("theme")).toBe(
    switchedEmbeddedDocumentUrl.searchParams.get("theme"),
  );

  const pdfResponse = await page.context().request.get(
    new URL(switchedPdfHref, page.url()).toString(),
  );
  const pdfBuffer = await pdfResponse.body();

  expect(pdfResponse.ok()).toBe(true);
  expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");
  expect(pdfResponse.headers()["content-disposition"]).toContain(".pdf");
  expect(pdfBuffer.subarray(0, 4).toString()).toBe("%PDF");
  expect(pdfBuffer.byteLength).toBeGreaterThan(500);
  expect(pdfBuffer.byteLength).toBeLessThan(2_000_000);

  await page.goto(editorUrlBeforePreview);
  await expect(page).toHaveURL(editorUrlBeforePreview);

  const currentEventUrl = page.url();
  const archiveNavigation = page.getByRole("navigation", { name: "公演ナビゲーション" });
  const duplicateButton = archiveNavigation.getByRole("button", { name: "複製" });
  await expect(duplicateButton).toBeVisible();
  await duplicateButton.click();
  await expect(page).not.toHaveURL(currentEventUrl, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /コピー/ })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("link", { name: "Proでテンプレート保存を有効化" }).click();
  await expect(page).toHaveURL(/\/settings\/billing$/);
  await expect(page.getByRole("heading", { name: "請求サマリー" })).toBeVisible();
});

test("lets a pro user save and reinstantiate a template", async ({ page }) => {
  const credentials = uniqueCredentials("pro-template");

  await registerAndLogin(page, credentials);

  await page.getByRole("complementary").getByRole("button", { name: "新規公演作成" }).click();
  await expect(page).toHaveURL(/\/events\/.+/);

  await seedProSubscription(credentials.email);
  await page.reload();

  await expect(page.getByRole("button", { name: "この内容をテンプレート保存" })).toBeVisible();
  await page.getByLabel("テンプレート名").fill("Tour opener");
  await page.getByLabel("補足").fill("E2E template save");
  await page.getByRole("button", { name: "この内容をテンプレート保存" }).click();

  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole("heading", { name: "テンプレート管理" })).toBeVisible();
  await expect(page.getByText("Tour opener")).toBeVisible();

  await page.getByRole("button", { name: "このテンプレートで公演作成" }).click();
  await expect(page).toHaveURL(/\/events\/.+/);
  await expect(page.getByRole("heading", { name: /Tour opener/ })).toBeVisible();
});

test("keeps the selected pdf preset active for pro users across preview and download", async ({
  page,
}) => {
  const credentials = uniqueCredentials("pro-preset");

  await registerAndLogin(page, credentials);
  await seedProSubscription(credentials.email);
  const currentTheme = "dark" as const;
  const eventId = await seedEventWithSong(credentials.email, currentTheme);
  await page.goto(`/events/${eventId}?theme=${currentTheme}`);

  await page.getByRole("button", { name: "PDF出力" }).click();
  await page.waitForLoadState("domcontentloaded");

  await expect(page).toHaveURL(new RegExp(`/events/${eventId}/pdf\\?theme=dark$`));
  await expect(page.getByText("PDF出力プリセット")).toBeVisible();
  await expect(page.getByRole("link", { name: "Standard Dark" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("link", { name: "Large Type" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Large Type" })).not.toHaveAttribute(
    "aria-current",
    "page",
  );

  await page.getByRole("link", { name: "Large Type" }).click();
  await page.waitForLoadState("domcontentloaded");

  await expect(page).toHaveURL(new RegExp(`/events/${eventId}/pdf\\?theme=dark&preset=large-type$`));
  await expect(page.getByRole("link", { name: "Large Type" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.reload();
  await expect(page).toHaveURL(
    new RegExp(`/events/${eventId}/pdf\\?theme=dark&preset=large-type$`),
  );
  await expect(page.getByRole("link", { name: "Large Type" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.getByRole("link", { name: "LIGHT", exact: true }).click();
  await page.waitForLoadState("domcontentloaded");
  await expect(page).toHaveURL(new RegExp(`/events/${eventId}/pdf\\?theme=light&preset=large-type$`));
  await expect(page.getByRole("link", { name: "LIGHT", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const presetEmbeddedDocumentHref = await page
    .locator('iframe[title="紙面プレビュー"]')
    .getAttribute("src");

  if (!presetEmbeddedDocumentHref) {
    throw new Error("Embedded document URL is missing after switching to the selected preset.");
  }

  const presetEmbeddedDocumentUrl = new URL(presetEmbeddedDocumentHref, page.url());
  expect(presetEmbeddedDocumentUrl.pathname).toBe(`/events/${eventId}/pdf/document`);
  expect(presetEmbeddedDocumentUrl.searchParams.get("theme")).toBe("light");
  expect(presetEmbeddedDocumentUrl.searchParams.get("preset")).toBe("large-type");
  await expect(page.getByRole("link", { name: "PDF出力" })).toHaveAttribute(
    "href",
    `/api/events/${eventId}/pdf?theme=light&preset=large-type`,
  );

  const downloadUrlPromise = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return (
      request.method() === "GET" &&
      url.pathname === `/api/events/${eventId}/pdf` &&
      url.searchParams.get("preset") === "large-type"
    );
  });
  await page.getByRole("link", { name: "PDF出力" }).click({ noWaitAfter: true });
  const downloadRequest = await downloadUrlPromise;
  const downloadRequestUrl = new URL(downloadRequest.url());

  expect(downloadRequestUrl.searchParams.get("preset")).toBe("large-type");
  expect(downloadRequestUrl.searchParams.get("theme")).toBe("light");
});
