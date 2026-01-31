const { sendSlackNotification } = require("../services/SlackService");
const { HttpError } = require("../util/HttpError");

/**
 * Handles an incident report with a stacktrace.
 * Validates the stacktrace, logs it, and returns a result.
 *
 * @param {string} stacktrace - Raw stacktrace from request body
 * @returns {{ success: boolean, message: string }}
 * @throws {HttpError} When stacktrace is missing
 */
function processIncident(stacktrace) {
  if (stacktrace === undefined || stacktrace === null) {
    throw new HttpError(400, "Missing required field: stacktrace");
  }

  const trace = typeof stacktrace === "string" ? stacktrace : String(stacktrace);
  console.log("[Incident] Stacktrace received:\n", trace);

  // 1. Figure out what part of the code is causing the incident fromn the stacktrace
  // 2. Fetch the past commit history for the whole project (for now)
  // 3. Fetch the top n committers with the most commit impact for the file
  // 4. Summarize the crash reason with Claude
  // 5. Summarize the commit history with Claude
  // 6. Send the summary to Slack

  sendSlackNotification(trace);
  return { success: true, message: "Stacktrace logged" };
}

module.exports = { logIncident: processIncident };
