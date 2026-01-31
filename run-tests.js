/**
 * Test runner - Runs all test files in the tests folder
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const testsDir = path.join(__dirname, "tests");

// Get all test files
const testFiles = fs
  .readdirSync(testsDir)
  .filter((file) => file.startsWith("test-") && file.endsWith(".js"))
  .map((file) => path.join(testsDir, file));

if (testFiles.length === 0) {
  console.log("❌ No test files found in tests/ folder");
  process.exit(1);
}

console.log(`\n📋 Found ${testFiles.length} test file(s):\n`);
testFiles.forEach((file) => {
  console.log(`  - ${path.basename(file)}`);
});

console.log("\n");

let completed = 0;
let failed = false;

// Run each test file
testFiles.forEach((testFile, index) => {
  const testName = path.basename(testFile);

  console.log(`\n${"=".repeat(50)}`);
  console.log(`Running: ${testName} (${index + 1}/${testFiles.length})`);
  console.log(`${"=".repeat(50)}\n`);

  const child = spawn("node", [testFile]);

  child.stdout.on("data", (data) => {
    process.stdout.write(data);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  child.on("close", (code) => {
    completed++;
    if (code !== 0) {
      failed = true;
    }

    if (completed === testFiles.length) {
      console.log(`\n${"=".repeat(50)}`);
      console.log(`All tests completed!`);
      console.log(`${"=".repeat(50)}\n`);
      process.exit(failed ? 1 : 0);
    }
  });
});
