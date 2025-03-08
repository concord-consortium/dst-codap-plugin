import { test, expect } from "@playwright/test";

test("Test app inside of CODAP", async ({page}) => {
  await page.setViewportSize({width: 1400, height: 800});
  await page.goto("https://codap3.concord.org/?mouseSensor&di=https://localhost:8080");

  // Move the table over 80 pixels so it doesn't overlap with the plugin
  const table = page.getByTestId("codap-case-table");
  await table.hover({position: {x: 3, y: 3}});
  const box = await table.boundingBox() || {x: 0, y: 0};
  await page.mouse.down();
  await page.mouse.move(box.x + 83, box.y + 3);
  await page.mouse.move(box.x + 83, box.y + 3);
  await page.mouse.up();

  const iframe = page.frameLocator(".codap-web-view-iframe");
  const firstLegendArea = iframe.getByText("To create a Color Legend");
  await firstLegendArea.click();
  await expect(iframe.getByTestId("axis-legend-attribute-button-legend")).toHaveText("Magnitude (0-5)");
});
