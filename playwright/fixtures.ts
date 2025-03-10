import { test as baseTest } from "@playwright/test";
import { test as coverageTest} from "@bgotink/playwright-coverage";

export const test = process.env.CI ? coverageTest: baseTest;

// TODO: The following approach would be a better way to make it easier to add
// additional fixtures. However the typing didn't work out. Once we have a 
// second fixture then we can sort out a nice way to list them, and conditionally 
// add ones like the coverage fixture.
// 
// const fixtureTests = [
//     baseTest
// ];
// if (process.env.CI) {
//     fixtureTests.push(coverageTest);
// }
// export const test = mergeTests(...fixtureTests);
