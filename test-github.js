/**
 * Simple test script for GitHub API endpoints
 * Run with: node test-github.js
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
    return false;
  }
}

async function runTests() {
  log("\n=== GitHub API Integration Tests ===\n", "yellow");

  let passed = 0;
  let failed = 0;

  // Test 1: Fetch file history from your own repo
  if (
    await test(
      "Fetch last 5 commits from ichack26/package.json",
      async () => {
        const response = await axios.get(
          `${BASE_URL}/github/file-history/yejin-angela-moon/ichack26/package.json`
        );

        if (!response.data.success) throw new Error("Response not successful");
        if (response.data.commits.length === 0)
          throw new Error("No commits returned");
        if (!response.data.commits[0].sha)
          throw new Error("Missing commit SHA");
        if (!response.data.commits[0].message)
          throw new Error("Missing commit message");

        log(`  Found ${response.data.count} commits`, "green");
        response.data.commits.forEach((commit, i) => {
          log(
            `  ${i + 1}. ${commit.shortSha} - ${commit.message.split("\n")[0]}`,
            "green"
          );
        });
      }
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 2: Fetch with custom count
  if (
    await test("Fetch last 3 commits with custom count", async () => {
      const response = await axios.get(
        `${BASE_URL}/github/file-history/yejin-angela-moon/ichack26/package.json?count=3`
      );

      if (response.data.count !== 3)
        throw new Error(`Expected 3 commits, got ${response.data.count}`);

      log(`  ✓ Returned exactly ${response.data.count} commits`, "green");
    })
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 3: Test with a popular repo (React)
  if (
    await test(
      "Fetch commits from popular repo (facebook/react)",
      async () => {
        const response = await axios.get(
          `${BASE_URL}/github/file-history/facebook/react/package.json?count=3`
        );

        if (!response.data.success) throw new Error("Response not successful");
        if (response.data.commits.length === 0)
          throw new Error("No commits returned");

        log(`  Found ${response.data.count} commits from React`, "green");
        response.data.commits.slice(0, 2).forEach((commit, i) => {
          log(
            `  ${i + 1}. ${commit.author} - ${commit.shortSha}`,
            "green"
          );
        });
      }
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 4: Test with specific file path
  if (
    await test(
      "Fetch commits from specific file path (Node.js)",
      async () => {
        const response = await axios.get(
          `${BASE_URL}/github/file-history/nodejs/node/package.json?count=2`
        );

        if (!response.data.success) throw new Error("Response not successful");
        if (response.data.commits.length === 0)
          throw new Error("No commits returned");

        log(`  Found ${response.data.count} commits for Node.js package.json`, "green");
      }
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 5: Test commit details endpoint
  if (
    await test("Fetch detailed commit information", async () => {
      // First get a commit SHA
      const historyResponse = await axios.get(
        `${BASE_URL}/github/file-history/yejin-angela-moon/ichack26/package.json?count=1`
      );

      const sha = historyResponse.data.commits[0].sha;

      // Then fetch details
      const detailsResponse = await axios.get(
        `${BASE_URL}/github/commit/yejin-angela-moon/ichack26/${sha}`
      );

      if (!detailsResponse.data.commit)
        throw new Error("Missing commit data");
      if (!detailsResponse.data.commit.filesChanged)
        throw new Error("Missing filesChanged data");

      log(`  ✓ Commit ${detailsResponse.data.commit.shortSha}`, "green");
      log(
        `  Files changed in this commit: ${detailsResponse.data.commit.filesChanged.length}`,
        "green"
      );
      detailsResponse.data.commit.filesChanged.forEach((file) => {
        log(
          `    - ${file.filename} (${file.status}): +${file.additions} -${file.deletions}`,
          "green"
        );
      });
    })
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 6: Error handling - invalid repo
  if (
    await test("Error handling - invalid repository", async () => {
      try {
        await axios.get(
          `${BASE_URL}/github/file-history/nonexistent/fakerepo/somefile.js`
        );
        throw new Error("Should have failed with 404");
      } catch (error) {
        if (error.response?.status === 400) {
          log(
            `  ✓ Correctly returned error: ${error.response.data.message}`,
            "green"
          );
        } else {
          throw error;
        }
      }
    })
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 7: Error handling - invalid count
  if (
    await test("Error handling - invalid count parameter", async () => {
      try {
        await axios.get(
          `${BASE_URL}/github/file-history/facebook/react/package.json?count=999`
        );
        throw new Error("Should have failed");
      } catch (error) {
        if (error.response?.status === 400) {
          log(
            `  ✓ Correctly returned error: ${error.response.data.message}`,
            "green"
          );
        } else {
          throw error;
        }
      }
    })
  ) {
    passed++;
  } else {
    failed++;
  }

  // Summary
  log("\n=== Test Summary ===", "yellow");
  log(`Passed: ${passed}`, "green");
  log(`Failed: ${failed}`, failed > 0 ? "red" : "green");
  log(
    `Total: ${passed + failed}\n`,
    failed > 0 ? "red" : "green"
  );

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  log(`Unexpected error: ${error.message}`, "red");
  process.exit(1);
});
