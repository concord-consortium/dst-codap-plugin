import { PlaywrightCoverageOptions } from "@bgotink/playwright-coverage";
import { defineConfig, devices, ReporterDescription } from "@playwright/test";
import path from "path";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const collectCoverage = !!process.env.CI;
const coverageReporter: ReporterDescription = [
  "@bgotink/playwright-coverage",
  /** @type {import('@bgotink/playwright-coverage').CoverageReporterOptions} */ {
    // Path to the root files should be resolved from, most likely your repository root
    sourceRoot: __dirname,
    // The coverage seems to be reported with a prefix. This is probably because we are 
    // running with an iframe so the coverage is separated by the two projects.
    exclude: [
      // Because we are running in an iframe inside of CODAPv3 the coverage reporter includes
      // codap3.
      "codap3/src/**", "codap3/webpack/**",
      // This plugin has a copy of many of the codap files which are tested within CODAP so
      // we're going to ignore them here
      "dst-codap-plugin/src/codap/**"
    
    ],
    // Directory in which to write coverage reports
    resultDir: path.join(__dirname, "results/e2e-coverage"),
    // Configure the reports to generate.
    // The value is an array of istanbul reports, with optional configuration attached.
    reports: [
      // Create an HTML view at <resultDir>/index.html
      ["html"],
      // Create <resultDir>/coverage.lcov for consumption by tooling
      [
        "lcovonly",
        {
          file: "coverage.lcov",
        },
      ],
      // Log a coverage summary at the end of the test run
      [
        "text-summary",
        {
          file: null,
        },
      ],
    ],
    // Configure watermarks, see https://github.com/istanbuljs/nyc#high-and-low-watermarks
    // watermarks: {},
  },
];

// We report json in CI so that a summary of the results can be added to a comment in the PR
const reportJson = !!process.env.CI;
const jsonReporter: ReporterDescription = ["json", { outputFile: "results.json" }];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<PlaywrightCoverageOptions>({
  testDir: "./playwright",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [ 
    [ "html" ], 
    ...(collectCoverage ? [coverageReporter] : []),
    ...(reportJson ? [jsonReporter] : []),
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    ignoreHTTPSErrors: true,

    /* This setting is ignored by the current version of playwright-coverage 
       I submitted a PR to fix that: https://github.com/bgotink/playwright-coverage/pull/27
       In the meantime the coverage is skipped by not mixing in the text method.
    */
    collectCoverage,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run local dev server before starting the tests */
  webServer: {
    command: "npm run start:secure",
    url: "https://localhost:8080/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    ignoreHTTPSErrors: true,
  },
});
