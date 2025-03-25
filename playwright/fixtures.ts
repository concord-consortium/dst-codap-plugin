import { mergeTests } from "@playwright/test";
import { test as coverageTest} from "@bgotink/playwright-coverage";

export const test = mergeTests(
  // coverageTest will be disabled in CI by playwright.config.ts
  coverageTest,
);
