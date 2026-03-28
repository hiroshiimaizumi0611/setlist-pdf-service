import { eq } from "drizzle-orm";
import { expect, test } from "playwright/test";
import { db, dbReady } from "../../lib/db/client";
import { subscription, user } from "../../lib/db/schema";

test.describe.configure({ mode: "serial" });

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
  await expect(page.getByRole("heading", { name: "アカウントを作成" })).toBeVisible();
  await expect(page.getByLabel("名前")).toBeVisible();
  await expect(page.getByLabel("メールアドレス")).toBeVisible();
  await expect(page.getByLabel("パスワード")).toBeVisible();

  const signUpResponse = await page.context().request.post(
    "http://localhost:3000/api/auth/sign-up/email",
    {
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
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
  await expect(page).toHaveURL(/\/events$/, { timeout: 15_000 });
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

test("supports the free-tier event flow, preview export, duplication, and upgrade", async ({
  page,
}) => {
  const credentials = uniqueCredentials("free-flow");

  await registerAndLogin(page, credentials);

  await page.locator("form").first().evaluate((form) => {
    (form as HTMLFormElement).requestSubmit();
  });
  await expect(page).toHaveURL(/\/events\/.+/);
  const eventUrl = new URL(page.url());
  const eventId = eventUrl.pathname.split("/").at(-1);

  if (!eventId) {
    throw new Error("Event id is missing from the editor URL.");
  }

  const pdfLink = page.getByRole("link", { name: "PDF出力" });
  const editorPdfHref = await pdfLink.getAttribute("href");

  if (!editorPdfHref) {
    throw new Error("PDF export link is missing.");
  }

  const currentTheme = new URL(editorPdfHref, "http://localhost:3000").searchParams.get("theme");

  if (currentTheme !== "light" && currentTheme !== "dark") {
    throw new Error(`Unexpected PDF theme value: ${currentTheme ?? "missing"}`);
  }

  await expect(pdfLink).toHaveAttribute(
    "href",
    new RegExp(`^/events/.+/pdf\\?theme=${currentTheme}$`),
  );

  const [previewPage] = await Promise.all([
    page.waitForEvent("popup"),
    pdfLink.click(),
  ]);

  await previewPage.waitForLoadState("domcontentloaded");
  await expect(previewPage).toHaveURL(
    new RegExp(`^http://localhost:3000/events/.+/pdf\\?theme=${currentTheme}$`),
  );
  await expect(previewPage.getByRole("region", { name: "紙面プレビュー" })).toBeVisible();
  await expect(previewPage.getByRole("complementary")).toBeVisible();
  await expect(previewPage.getByText("PDFテーマ切替")).toBeVisible();
  await expect(previewPage.getByText("出力サイズ選択")).toBeVisible();
  await expect(previewPage.getByText("ページ継続確認")).toBeVisible();
  await expect(
    previewPage.getByRole("link", {
      name: currentTheme === "dark" ? "DARK" : "LIGHT",
    }),
  ).toHaveAttribute("aria-current", "page");

  const embeddedDocument = previewPage.locator('iframe[title="紙面プレビュー"]');
  const embeddedDocumentHref = await embeddedDocument.getAttribute("src");

  if (!embeddedDocumentHref) {
    throw new Error("Embedded document URL is missing from the preview page.");
  }

  const embeddedDocumentUrl = new URL(embeddedDocumentHref);

  expect(embeddedDocumentUrl.pathname).toBe(`/events/${eventId}/pdf/document`);
  expect(embeddedDocumentUrl.searchParams.get("theme")).toBe(currentTheme);
  await expect(
    previewPage
      .frameLocator('iframe[title="紙面プレビュー"]')
      .locator("[data-pdf-document]"),
  ).toHaveAttribute("data-theme", currentTheme);

  const previewPdfLink = previewPage.getByRole("link", { name: "PDF出力" });
  await expect(previewPdfLink).toHaveAttribute(
    "href",
    new RegExp(`^/api/events/${eventId}/pdf\\?theme=${currentTheme}$`),
  );
  const pdfHref = await previewPdfLink.getAttribute("href");

  if (!pdfHref) {
    throw new Error("PDF export link is missing from the preview page.");
  }

  const previewDownloadUrl = new URL(pdfHref, previewPage.url());
  expect(previewDownloadUrl.pathname).toBe(`/api/events/${eventId}/pdf`);
  expect(previewDownloadUrl.searchParams.get("theme")).toBe(currentTheme);
  expect(previewDownloadUrl.searchParams.get("theme")).toBe(
    embeddedDocumentUrl.searchParams.get("theme"),
  );

  const alternateTheme = currentTheme === "dark" ? "light" : "dark";
  const alternateThemeLabel = alternateTheme === "dark" ? "DARK" : "LIGHT";

  await previewPage.getByRole("link", { name: alternateThemeLabel }).click();
  await previewPage.waitForLoadState("domcontentloaded");
  await expect(previewPage).toHaveURL(
    new RegExp(`^http://localhost:3000/events/${eventId}/pdf\\?theme=${alternateTheme}$`),
  );
  await expect(
    previewPage.getByRole("link", { name: alternateThemeLabel }),
  ).toHaveAttribute("aria-current", "page");

  const switchedEmbeddedDocumentHref = await embeddedDocument.getAttribute("src");

  if (!switchedEmbeddedDocumentHref) {
    throw new Error("Embedded document URL is missing after switching preview theme.");
  }

  const switchedEmbeddedDocumentUrl = new URL(switchedEmbeddedDocumentHref);

  expect(switchedEmbeddedDocumentUrl.pathname).toBe(`/events/${eventId}/pdf/document`);
  expect(switchedEmbeddedDocumentUrl.searchParams.get("theme")).toBe(alternateTheme);
  await expect(
    previewPage
      .frameLocator('iframe[title="紙面プレビュー"]')
      .locator("[data-pdf-document]"),
  ).toHaveAttribute("data-theme", alternateTheme);

  await expect(previewPdfLink).toHaveAttribute(
    "href",
    new RegExp(`^/api/events/${eventId}/pdf\\?theme=${alternateTheme}$`),
  );
  const switchedPdfHref = await previewPdfLink.getAttribute("href");

  if (!switchedPdfHref) {
    throw new Error("PDF export link is missing after switching preview theme.");
  }

  const switchedPreviewDownloadUrl = new URL(switchedPdfHref, previewPage.url());
  expect(switchedPreviewDownloadUrl.pathname).toBe(`/api/events/${eventId}/pdf`);
  expect(switchedPreviewDownloadUrl.searchParams.get("theme")).toBe(
    alternateTheme,
  );
  expect(switchedPreviewDownloadUrl.searchParams.get("theme")).toBe(
    switchedEmbeddedDocumentUrl.searchParams.get("theme"),
  );

  const pdfResponse = await previewPage.context().request.get(
    new URL(switchedPdfHref, previewPage.url()).toString(),
  );
  const pdfBuffer = await pdfResponse.body();

  expect(pdfResponse.ok()).toBe(true);
  expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");
  expect(pdfResponse.headers()["content-disposition"]).toContain(".pdf");
  expect(pdfBuffer.subarray(0, 4).toString()).toBe("%PDF");
  expect(pdfBuffer.byteLength).toBeGreaterThan(500);
  expect(pdfBuffer.byteLength).toBeLessThan(2_000_000);

  const currentEventUrl = page.url();
  await page.getByRole("button", { name: "この公演を複製" }).click();
  await expect(page).not.toHaveURL(currentEventUrl, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /コピー/ })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("link", { name: "Proでテンプレート保存を有効化" }).click();
  await expect(page).toHaveURL(/\/settings\/billing$/);
  await expect(page.getByRole("heading", { name: "プラン管理" })).toBeVisible();
});

test("lets a pro user save and reinstantiate a template", async ({ page }) => {
  const credentials = uniqueCredentials("pro-template");

  await registerAndLogin(page, credentials);

  await page.locator("form").first().evaluate((form) => {
    (form as HTMLFormElement).requestSubmit();
  });
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
