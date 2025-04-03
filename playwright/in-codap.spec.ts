import { expect } from "@playwright/test";
import { test } from "./fixtures";

test("Test app inside of CODAP", async ({ page }) => {
  await page.setViewportSize({width: 1400, height: 800});
  await page.goto("https://codap3.concord.org/?mouseSensor&di=https://localhost:8080");

  // Move the table over 80 pixels so it doesn't overlap with the plugin
  const table = page.getByTestId("codap-case-table");
  await table.hover({ position: { x: 3, y: 3 } });
  const box = await table.boundingBox() || {x: 0, y: 0};
  await page.mouse.down();
  await page.mouse.move(box.x + 83, box.y + 3);
  await page.mouse.move(box.x + 83, box.y + 3);
  await page.mouse.up();

  const iframe = page.frameLocator(".codap-web-view-iframe");
  const firstLegendArea = iframe.getByText("To create a Color Legend");
  await firstLegendArea.click();
  await expect(iframe.getByTestId("attribute-label")).toHaveText("Magnitude (0-5)");
});

test("Test tabs", async ({ page }) => {
  await page.setViewportSize({width: 1400, height: 800});
  await page.goto("https://codap3.concord.org/?mouseSensor&di=https://localhost:8080");

  // We should start on the graph tab
  const graphText = "To create a Color Legend click here";
  const aboutText = "This plug in is designed for exploration of spatiotemporal data.";
  const iframe = page.frameLocator(".codap-web-view-iframe");
  const graphTab = iframe.getByRole("tab", { name: "3D Graph" });
  const aboutTab = iframe.getByRole("tab", { name: "About" });
  await expect(graphTab).toHaveAttribute("aria-selected", "true");
  await expect(aboutTab).toHaveAttribute("aria-selected", "false");
  await expect(iframe.getByRole("tabpanel")).toContainText(graphText);
  await expect(iframe.getByRole("tabpanel")).not.toContainText(aboutText);

  // Switch to the about tab
  await aboutTab.click();
  await expect(aboutTab).toHaveAttribute("aria-selected", "true");
  await expect(graphTab).toHaveAttribute("aria-selected", "false");
  await expect(iframe.getByRole("tabpanel")).not.toContainText(graphText);
  await expect(iframe.getByRole("tabpanel")).toContainText(aboutText);
});
