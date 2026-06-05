// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// add code coverage support
import "@cypress/code-coverage/support";

// The plugin is designed to run embedded in CODAP and talks to the host over
// iframe-phone. In the Cypress harness there is no CODAP parent to answer those
// API calls, so initialization can surface errors / unhandled rejections during
// page load. (workspace.test.ts notes this.) These are expected in the harness
// and must not fail the tests — without this handler such an error during
// cy.visit() fails the first test and skips the rest, which shows up only under
// CI timing. Assertions still run normally; we just don't treat app-origin
// exceptions as test failures.
Cypress.on("uncaught:exception", () => false);
