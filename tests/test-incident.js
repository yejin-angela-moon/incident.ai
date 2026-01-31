/**
 * Test script for Incident API endpoint
 * Run with: node tests/test-incident.js
 *
 * NOTE: Ensure the server is running on localhost:3000 before running this test.
 */

const { exampleStackTrace, systemPrompt } = require("../src/ai/SystemPrompt");
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
  log("\n=== Incident API Integration Tests ===\n", "yellow");

  let passed = 0;
  let failed = 0;

  // Test 1: Simulate the Incident Analysis (Send request to Claude directly)
  // The user asked: "It needs to send a request to Claude with the system prompt, stack trace and get the JSON value."
  // const success1 =
  //   await test("Directly Call Claude with System Prompt & Stack Trace", async () => {
  //     const prompt = `${systemPrompt}\n\nThe stack trace is: ${exampleStackTrace}`;

  //     // We hit the chat endpoint which calls Claude
  //     const response = await axios.post(`${BASE_URL}/chat`, { prompt: prompt });

  //     if (response.status !== 200) {
  //       throw new Error(`Expected status 200 but got ${response.status}`);
  //     }

  //     if (!response.data || !response.data.response) {
  //       throw new Error("Response body missing 'response' field");
  //     }

  //     const jsonString = response.data.response;
  //     console.log("Raw Response:", jsonString);

  //     // Verify it parses as JSON
  //     const data = JSON.parse(jsonString);

  //     // Verify required fields
  //     const requiredFields = ["errorType", "errorMessage", "files", "methods"];
  //     for (const field of requiredFields) {
  //       if (!(field in data)) {
  //         throw new Error(`Missing field in JSON response: ${field}`);
  //       }
  //     }

  //     console.log("Parsed JSON:", data);
  //   });

  // if (success1) passed++;
  // else failed++;

  // Test 2: Call the Incident Endpoint (End-to-End)
  const success2 = await test("Call POST /api/incident", async () => {
    const response = await axios.post(`${BASE_URL}/incident`, {
      stacktrace: exampleStackTrace,
    });

    if (response.status !== 200) {
      throw new Error(`Expected status 200 but got ${response.status}`);
    }

    console.log("Incident Endpoint Response:", response.data);
  });

  if (success2) passed++;
  else failed++;

  log(
    `\nTests completed: ${passed} passed, ${failed} failed`,
    failed > 0 ? "red" : "green",
  );
  if (failed > 0) process.exit(1);
}

runTests();
