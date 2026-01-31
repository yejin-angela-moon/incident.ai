const { default: axios } = require("axios");
const { sendSlackNotification } = require("../services/SlackService");
const { HttpError } = require("../util/HttpError");

const BASE_URL = "http://localhost:3000/api"; // TODO: Change to the actual URL

/**
 * Handles an incident report with a stacktrace.
 * Validates the stacktrace, logs it, and returns a result.
 *
 * @param {string} stacktrace - Raw stacktrace from request body
 * @returns {{ success: boolean, message: string }}
 * @throws {HttpError} When stacktrace is missing
 */
async function processIncident(stacktrace) {
  if (stacktrace === undefined || stacktrace === null) {
    throw new HttpError(400, "Missing required field: stacktrace");
  }

  const trace = typeof stacktrace === "string" ? stacktrace : String(stacktrace);
  console.log("[Incident] Stacktrace received:\n", trace);

  // 1. Figure out what part of the code is causing the incident fromn the stacktrace
  // 2. Fetch the past commit history for the whole project (for now)
  // 3. Fetch the top n committers with the most commit impact for the file
  // 4. Summarize the crash reason with Claude
  const crashReasonResponse = await axios.post(`${BASE_URL}/chat`,
    { prompt: getPromptForCrashReason(trace) });
  const crashReason = crashReasonResponse.data.response;
  // 5. Summarize the commit history with Claude
  // 6. Send the summary to Slack

  const slackReport = generateSlackReport(crashReason, "empty", "empty");
  sendSlackNotification(slackReport);
  return { success: true, message: "Incident processed" };
}

function getPromptForCrashReason(stacktrace) {
  return `
  You are a helpful assistant that analyzes stack traces and provides a summary of the crash reason.
  Be concise but detailed.
  The stack trace is: ${stacktrace}
  `;
}

function generateSlackReport(crashReason, commitHistory, topCommitters) {
  return `
  *Crash Reason*: ${crashReason}
  *Commit History*: ${commitHistory}
  *Top Committers*: ${topCommitters}
  `;
}

module.exports = { processIncident: processIncident };
