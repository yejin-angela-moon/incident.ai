/**
 * Simple test script for Chat API endpoint
 * Run with: node tests/test-chat.js
 *
 * NOTE: Ensure the server is running on localhost:3000 before running this test.
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(`\n► Testing: ${name}`, "blue");
    await fn();
    log(`✓ Passed: ${name}`, "green");
    return true;
  } catch (error) {
    log(`✗ Failed: ${name}`, "red");
    log(`  Error: ${error.message}`, "red");
    if (error.response) {
      log(`  Status: ${error.response.status}`, "red");
      log(`  Data: ${JSON.stringify(error.response.data)}`, "red");
    }
    return false;
  }
}

async function runTests() {
  log("\n=== Chat API Integration Tests ===\n", "yellow");

  let passed = 0;
  let failed = 0;

  // Test 1: Send a simple prompt
  const success = await test("Send 'Hello' prompt to Claude", async () => {
    const prompt = "Hello, are you working?";
    const response = await axios.post(`${BASE_URL}/chat`, { prompt: prompt });

    if (response.status !== 200) {
      throw new Error(`Expected status 200 but got ${response.status}`);
    }

    if (!response.data || !response.data.response) {
      throw new Error("Response body missing 'response' field");
    }

    console.log(
      `  Response from AI: ${response.data.response.substring(0, 50)}...`,
    );
  });

  if (success) passed++;
  else failed++;

  log(
    `\nTests completed: ${passed} passed, ${failed} failed`,
    failed > 0 ? "red" : "green",
  );
  if (failed > 0) process.exit(1);
}

runTests();
