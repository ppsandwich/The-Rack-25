import { expect, test } from "@playwright/test";

const engineNames = [
  "Warm Analog",
  "Soft Poly",
  "Mono Furnace",
  "Classic OB",
  "FM Bells",
  "DX Stack",
  "Cartridge FM",
  "Wavetable Drift",
  "Surge Hybrid",
  "Additive Lantern",
  "Pad Weaver",
  "Noise Harmonics",
  "Sampled Keys",
  "SoundFont Rack",
  "Tiny GM",
  "Chip Arcade",
  "Drum Synth Kit",
  "Karplus Pluck",
  "Modal Mallets",
  "Open Piano",
  "Granular Cloud",
  "Formant Vox",
  "Byte Crusher",
  "Vector Blend",
  "Zen Rack"
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __rack25Starts: number }).__rack25Starts = 0;
    window.addEventListener("rack25-audio-start", () => {
      (window as unknown as { __rack25Starts: number }).__rack25Starts += 1;
    });
    const proto = (window as unknown as { AudioScheduledSourceNode?: { prototype: AudioScheduledSourceNode } }).AudioScheduledSourceNode?.prototype;
    if (proto) {
      const originalStart = proto.start;
      proto.start = function patchedStart(this: AudioScheduledSourceNode, ...args: Parameters<AudioScheduledSourceNode["start"]>) {
        (window as unknown as { __rack25Starts: number }).__rack25Starts += 1;
        return originalStart.apply(this, args);
      };
    }
  });
  await page.goto("/");
  page.on("dialog", (dialog) => dialog.accept(dialog.type() === "prompt" ? "QA Saved Preset" : undefined));
  await page.getByRole("button", { name: /Start playing/i }).click();
});

test("boots, lists exactly 25 engines, and exposes required app surfaces", async ({ page }) => {
  await expect(page.getByText("The Rack-25").first()).toBeVisible();
  await expect(page.getByText("zero API routes")).toBeVisible();
  await expect(page.locator(".engine")).toHaveCount(25);

  for (const name of engineNames) {
    await expect(page.locator(".engine", { hasText: name })).toBeVisible();
  }

  await page.getByPlaceholder("Search engines").fill("Granular");
  await expect(page.locator(".engine")).toHaveCount(1);
  await expect(page.locator(".engine", { hasText: "Granular Cloud" })).toBeVisible();

  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByPlaceholder("Search engines").fill("");
  await page.getByRole("button", { name: "Pad", exact: true }).click();
  await expect(page.locator(".engine").first()).toBeVisible();
});

test("every engine switches, has presets, parameters, macros, credits, and starts audio nodes", async ({ page }) => {
  for (const name of engineNames) {
    await page.locator(".engine", { hasText: name }).click();
    await expect(page.locator(".now b")).toContainText(name);
    await expect(page.locator(".preset")).toHaveCount(8);
    await expect.poll(() => page.locator(".control").count()).toBeGreaterThan(7);
    await expect.poll(() => page.locator(".macro").count()).toBeGreaterThan(3);

    const before = await page.evaluate(() => (window as unknown as { __rack25Starts?: number }).__rack25Starts ?? 0);
    await page.locator(".keybed button").nth(12).dispatchEvent("pointerdown", { pointerId: 1 });
    await page.waitForTimeout(80);
    await page.locator(".keybed button").nth(12).dispatchEvent("pointerup", { pointerId: 1 });
    const after = await page.evaluate(() => (window as unknown as { __rack25Starts?: number }).__rack25Starts ?? 0);
    expect(after, `${name} should start one or more audio source nodes`).toBeGreaterThan(before);
  }
});

test("preset save, recall, delete, import, export, settings, credits, keyboard, and panic work", async ({ page }) => {
  await page.locator(".macro input").first().fill("0.31");
  await expect(page.locator(".now small")).toContainText("*");

  await page.getByRole("button", { name: /Save preset/i }).click();
  await page.locator(".preset", { hasText: "QA Saved Preset" }).waitFor();

  await page.reload();
  await page.getByRole("button", { name: /Start playing/i }).click();
  await expect(page.locator(".preset", { hasText: "QA Saved Preset" })).toBeVisible();
  await page.locator(".preset", { hasText: "QA Saved Preset" }).getByRole("button").first().click();
  await expect(page.locator(".now small")).toContainText("QA Saved Preset");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export current/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/qa-saved-preset|warm-analog/i);

  await page.setInputFiles("input[type=file]", {
    name: "imported-rack25-preset.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({
      schemaVersion: 1,
      engineId: "warm-analog",
      name: "Imported QA Patch",
      author: "QA",
      source: "user",
      tags: ["Imported"],
      parameters: {
        level: 0.5,
        shape: 0.4,
        detune: 5,
        cutoff: 2000,
        resonance: 1,
        attack: 0.01,
        decay: 0.2,
        sustain: 0.6,
        release: 0.5,
        motion: 0.2,
        bite: 0.2,
        space: 0.2,
        width: 0.4,
        punch: 0.3
      },
      macros: { tone: 0.4, shape: 0.4, motion: 0.2, bite: 0.2 }
    }))
  });
  await expect(page.locator(".preset", { hasText: "Imported QA Patch" })).toBeVisible();

  await page.getByRole("button", { name: /Settings/i }).click();
  await expect(page.getByRole("heading", { name: /Settings/i })).toBeVisible();
  await page.locator(".settings-row input").first().fill("0.4");
  await page.locator(".close").click();

  await page.getByRole("button", { name: /Credits/i }).click();
  await expect(page.getByRole("heading", { name: "Open Source Credits" })).toBeVisible();
  await expect(page.locator(".credit-list article")).toHaveCount(25);
  await page.locator(".close").click();

  await page.keyboard.down("a");
  await expect.poll(() => page.locator(".keybed .down").count()).toBeGreaterThan(0);
  await page.keyboard.up("a");
  await page.getByRole("button", { name: /Panic/i }).click();
  await expect(page.locator(".keybed .down")).toHaveCount(0);

  await page.locator(".preset", { hasText: "QA Saved Preset" }).locator(".icon").click();
  await expect(page.locator(".preset", { hasText: "QA Saved Preset" })).toHaveCount(0);
});
