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
  await page.getByLabel("名前").fill(credentials.name);
  await page.getByLabel("メールアドレス").fill(credentials.email);
  await page.getByLabel("パスワード").fill(credentials.password);
  await page.getByRole("button", { name: "アカウントを作成" }).click();
  await expect(page).toHaveURL(/\/events$/, { timeout: 15_000 });

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

test("supports the free-tier event flow, duplication, export, and upgrade", async ({
  page,
}) => {
  const credentials = uniqueCredentials("free-flow");

  await registerAndLogin(page, credentials);

  await page.getByRole("button", { name: "新規公演を作成" }).click();
  await expect(page).toHaveURL(/\/events\/.+/);
  await expect(page.getByRole("link", { name: "PDFを書き出し" })).toHaveAttribute(
    "href",
    /\/api\/events\/.+\/pdf\?theme=light/,
  );

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

  await page.getByRole("button", { name: "新規公演を作成" }).click();
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
