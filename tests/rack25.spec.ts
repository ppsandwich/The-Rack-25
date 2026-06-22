import { expect, test } from "@playwright/test";

const engineNames = [
  "DX Stack",
  "FM Bells",
  "Tiny GM",
  "Warm Analog",
  "Soft Poly",
  "Mono Furnace",
  "Classic OB",
  "Sampled Keys",
  "SoundFont Rack",
  "Chip Arcade",
  "Drum Synth Kit",
  "Karplus Pluck",
  "Modal Mallets",
  "Open Piano",
  "Granular Cloud",
  "Formant Vox",
  "Byte Crusher"
];

const tonePresetEngineNames = new Set([
  "Warm Analog",
  "Soft Poly",
  "Mono Furnace",
  "Classic OB",
  "FM Bells",
  "Chip Arcade",
  "Drum Synth Kit",
  "Karplus Pluck",
  "Modal Mallets",
  "Open Piano",
  "Granular Cloud",
  "Formant Vox",
  "Byte Crusher"
]);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __rack25Starts: number }).__rack25Starts = 0;
    (window as unknown as { __rack25LastNote?: number }).__rack25LastNote = undefined;
    window.addEventListener("rack25-audio-start", (event) => {
      (window as unknown as { __rack25Starts: number }).__rack25Starts += 1;
      (window as unknown as { __rack25LastNote?: number }).__rack25LastNote = (event as CustomEvent<{ note?: number }>).detail?.note;
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
});

test("boots, lists exactly 17 engines, and exposes required app surfaces", async ({ page }) => {
  await expect(page.getByText("The Rack-25").first()).toBeVisible();
  await expect(page.locator(".brand img")).toHaveAttribute("src", "/rack-25-icon.svg");
  await expect(page.locator("link[rel='icon']")).toHaveAttribute("href", "/rack-25-icon.svg");
  await expect(page.getByText("zero API routes")).toBeVisible();
  await expect(page.locator(".engine")).toHaveCount(17);
  await expect(page.locator(".panel-head h2")).toContainText("Warm Analog");
  await expect(page.locator(".preset.active")).toContainText("Cool Guy Warm Analog");

  for (const name of engineNames) {
    await expect(page.locator(".engine", { hasText: name })).toBeVisible();
  }
  await expect(page.locator(".engine b").nth(0)).toHaveText("DX Stack");
  await expect(page.locator(".engine b").nth(1)).toHaveText("FM Bells");
  await expect(page.locator(".engine b").nth(2)).toHaveText("Tiny GM");

  await page.getByPlaceholder("Search engines").fill("Granular");
  await expect(page.locator(".engine")).toHaveCount(1);
  await expect(page.locator(".engine", { hasText: "Granular Cloud" })).toBeVisible();

  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByPlaceholder("Search engines").fill("");
  await page.getByRole("button", { name: "Pad", exact: true }).click();
  await expect(page.locator(".engine").first()).toBeVisible();
});

test("every engine switches, has presets, parameters, credits, and starts audio nodes", async ({ page }) => {
  for (const name of engineNames) {
    await page.locator(".engine", { hasText: name }).click();
    await expect(page.locator(".panel-head h2")).toContainText(name);
    if (tonePresetEngineNames.has(name)) {
      await expect(page.locator(".preset")).toHaveCount(24);
    } else if (name === "DX Stack") {
      await expect(page.locator(".preset")).toHaveCount(128);
      await expect(page.locator(".preset").first()).toContainText("E.PIANO 1");
      await expect(page.locator(".preset.active")).toContainText("E.PIANO 1");
    } else if (name === "Tiny GM") {
      await expect(page.locator(".preset")).toHaveCount(128);
    } else if (name === "Sampled Keys") {
      await expect(page.locator(".preset")).toHaveCount(53);
    } else if (name === "SoundFont Rack") {
      await expect(page.locator(".preset")).toHaveCount(128);
    } else {
      await expect(page.locator(".preset")).toHaveCount(8);
    }
    await expect.poll(() => page.locator(".control").count()).toBeGreaterThan(7);
    if (name === "DX Stack") {
      const algorithm = page.getByLabel("Algorithm");
      await expect(algorithm).toHaveAttribute("min", "1");
      await expect(algorithm).toHaveAttribute("max", "32");
      await expect(algorithm).toHaveAttribute("step", "1");
    }

    const before = await page.evaluate(() => (window as unknown as { __rack25Starts?: number }).__rack25Starts ?? 0);
    const keyBox = await page.locator(".keybed button").nth(12).boundingBox();
    if (!keyBox) throw new Error("Expected middle key to be visible");
    await page.mouse.move(keyBox.x + keyBox.width / 2, keyBox.y + keyBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(80);
    await page.mouse.up();
    const after = await page.evaluate(() => (window as unknown as { __rack25Starts?: number }).__rack25Starts ?? 0);
    expect(after, `${name} should start one or more audio source nodes`).toBeGreaterThan(before);
  }
});

test("preset save, recall, delete, import, export, settings, credits, keyboard, and panic work", async ({ page }) => {
  await page.getByLabel("Level").fill("0.31");

  await page.getByRole("button", { name: /Save preset/i }).click();
  await page.locator(".preset", { hasText: "QA Saved Preset" }).waitFor();

  await page.reload();
  await expect(page.locator(".preset", { hasText: "QA Saved Preset" })).toBeVisible();
  await page.locator(".preset", { hasText: "QA Saved Preset" }).getByRole("button").first().click();
  await expect(page.locator(".preset.active")).toContainText("QA Saved Preset");

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
  await expect(page.locator(".credit-list article")).toHaveCount(17);
  await page.locator(".close").click();

  await page.keyboard.down("f");
  await expect.poll(() => page.locator(".keybed .down").count()).toBeGreaterThan(0);
  await page.keyboard.up("f");
  await expect(page.getByText("Octave 0")).toBeVisible();
  await page.getByRole("button", { name: "Oct +" }).click();
  await expect(page.getByText("Octave +1")).toBeVisible();
  await expect(page.locator(".keybed button").nth(12)).toContainText("C3");
  await page.locator(".engine", { hasText: "DX Stack" }).click();
  await page.keyboard.down("f");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __rack25LastNote?: number }).__rack25LastNote)).toBe(60);
  await page.keyboard.up("f");
  await page.keyboard.down("j");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __rack25LastNote?: number }).__rack25LastNote)).toBe(65);
  await page.keyboard.up("j");
  const middleKey = await page.locator(".keybed button").nth(12).boundingBox();
  if (!middleKey) throw new Error("Expected middle key to be visible");
  await page.mouse.move(middleKey.x + middleKey.width / 2, middleKey.y + middleKey.height / 2);
  await page.mouse.down();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __rack25LastNote?: number }).__rack25LastNote)).toBe(60);
  await page.mouse.up();
  const dragFrom = await page.locator(".keybed button").nth(12).boundingBox();
  const dragTo = await page.locator(".keybed button").nth(14).boundingBox();
  if (!dragFrom || !dragTo) throw new Error("Expected drag keys to be visible");
  const startsBeforeDrag = await page.evaluate(() => (window as unknown as { __rack25Starts?: number }).__rack25Starts ?? 0);
  await page.mouse.move(dragFrom.x + dragFrom.width / 2, dragFrom.y + dragFrom.height / 2);
  await page.mouse.down();
  await page.mouse.move(dragTo.x + dragTo.width / 2, dragTo.y + dragTo.height / 2);
  await page.mouse.up();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __rack25Starts?: number }).__rack25Starts ?? 0)).toBeGreaterThan(startsBeforeDrag + 1);
  await page.getByRole("button", { name: "Oct -" }).click();
  await expect(page.getByText("Octave 0")).toBeVisible();
  const octaveBox = await page.locator(".octave-controls").boundingBox();
  const footerBox = await page.locator(".foot").boundingBox();
  expect(octaveBox && footerBox ? octaveBox.y + octaveBox.height <= footerBox.y : false).toBeTruthy();
  await page.getByRole("button", { name: /Panic/i }).click();
  await expect(page.locator(".keybed .down")).toHaveCount(0);

  await page.locator(".engine", { hasText: "Warm Analog" }).click();
  await page.locator(".preset", { hasText: "QA Saved Preset" }).locator(".icon").click();
  await expect(page.locator(".preset", { hasText: "QA Saved Preset" })).toHaveCount(0);
});

test("phone layout keeps selectors compact and avoids page-level horizontal overflow", async ({ page }) => {
  for (const width of [390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.locator(".engine")).toHaveCount(17);
    await expect(page.locator(".panel-head h2")).toBeVisible();
    await expect(page.locator(".control").first()).toBeVisible();

    const metrics = await page.evaluate(() => {
      const engineList = document.querySelector(".engine-list")?.getBoundingClientRect();
      const presetList = document.querySelector(".preset-list")?.getBoundingClientRect();
      const control = document.querySelector(".control")?.getBoundingClientRect();
      const topbar = document.querySelector(".topbar")?.getBoundingClientRect();
      const brand = document.querySelector(".brand")?.getBoundingClientRect();
      const status = document.querySelector(".status")?.getBoundingClientRect();
      const keybedPanel = document.querySelector(".keybed-panel");
      const keybedPanelRect = keybedPanel?.getBoundingClientRect();
      const keybed = document.querySelector(".keybed");
      const octave = document.querySelector(".octave-controls");
      const controlWidths = Array.from(document.querySelectorAll(".control")).map((control) => control.getBoundingClientRect().width);
      const groupWidths = Array.from(document.querySelectorAll(".param-group")).map((group) => group.getBoundingClientRect().width);
      const widestPanelRight = Math.max(
        ...[".app", ".topbar", ".rack", ".browser", ".center", ".presets", ".keybed-panel", ".keybed", ".octave-controls", ".foot"].map((selector) => document.querySelector(selector)?.getBoundingClientRect().right ?? 0)
      );
      const body = document.documentElement;
      return {
        documentWidth: body.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        viewportWidth: body.clientWidth,
        visualViewportWidth: window.visualViewport?.width ?? body.clientWidth,
        widestPanelRight,
        topbarHeight: topbar?.height ?? 0,
        brandBottom: brand?.bottom ?? 0,
        statusBottom: status?.bottom ?? 0,
        keybedPanelWidth: keybedPanelRect?.width ?? 0,
        keybedPanelScrollWidth: keybedPanel?.scrollWidth ?? 0,
        keybedWidth: keybed?.getBoundingClientRect().width ?? 0,
        keybedScrollWidth: keybed?.scrollWidth ?? 0,
        octaveWidth: octave?.getBoundingClientRect().width ?? 0,
        octaveScrollWidth: octave?.scrollWidth ?? 0,
        minControlWidth: Math.min(...controlWidths),
        maxControlWidth: Math.max(...controlWidths),
        minGroupWidth: Math.min(...groupWidths),
        maxGroupWidth: Math.max(...groupWidths),
        engineListHeight: engineList?.height ?? 0,
        presetListHeight: presetList?.height ?? 0,
        controlHeight: control?.height ?? 0
      };
    });

    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(metrics.widestPanelRight).toBeLessThanOrEqual(metrics.visualViewportWidth + 1);
    expect(metrics.keybedPanelScrollWidth).toBeLessThanOrEqual(metrics.keybedPanelWidth + 1);
    expect(metrics.keybedScrollWidth).toBeLessThanOrEqual(metrics.keybedWidth + 1);
    expect(metrics.octaveScrollWidth).toBeLessThanOrEqual(metrics.octaveWidth + 1);
    expect(metrics.topbarHeight).toBeLessThan(46);
    expect(Math.abs(metrics.brandBottom - metrics.statusBottom)).toBeLessThan(8);
    expect(metrics.maxControlWidth - metrics.minControlWidth).toBeLessThan(2);
    expect(metrics.minGroupWidth).toBeLessThan(metrics.viewportWidth * 0.3);
    expect(metrics.maxGroupWidth).toBeLessThan(metrics.viewportWidth);
    expect(metrics.engineListHeight).toBeLessThan(76);
    expect(metrics.presetListHeight).toBeLessThan(48);
    expect(metrics.controlHeight).toBeLessThan(62);
  }
});
