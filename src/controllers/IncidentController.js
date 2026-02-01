const { default: axios } = require("axios");
const fs = require("fs");
const path = require("path");
const { sendSlackNotification } = require("../services/SlackService");
const { HttpError } = require("../util/HttpError");
const { systemPrompt } = require("../ai/SystemPrompt");
const {
  getTopCommitsWithDiffs,
  getTopAuthorsForFile,
} = require("../services/GitHubService");
const crypto = require("crypto");

const BASE_URL = "http://localhost:3000/api"; // TODO: Change to the actual URL
const app_name = "broken_app";

/**
 * Handles an incident report with a stacktrace.
 * Validates the stacktrace, logs it, and returns a result.
 *
 * @param {string} stacktrace - Raw stacktrace from request body
 * @returns {{ success: boolean, message: string }}
 * @throws {HttpError} When stacktrace is missing
 */
async function processIncident(stacktrace, appName) {
  if (stacktrace === undefined || stacktrace === null) {
    throw new HttpError(400, "Missing required field: stacktrace");
  }

  const trace =
    typeof stacktrace === "string" ? stacktrace : String(stacktrace);
  console.log("[Incident] Stacktrace received:\n", trace);

  // 1. Figure out what part of the code is causing the incident fromn the stacktrace
  // 2. Fetch the past commit history for the whole project (for now)
  // 3. Fetch the top n committers with the most commit impact for the file
  // 4. Summarize the crash reason with Claude
  const crashReasonResponse = await axios.post(`${BASE_URL}/chat`, {
    prompt: getPromptForCrashReason(trace),
  });

  // - "errorType": The type of error (e.g., ReferenceError, TypeError).
  // - "errorMessage": The error message.
  // - "files": An array of file names with full paths involved in the error.
  // - "methods": An array of method names involved in the error.

  const crashReason = crashReasonResponse.data.response;
  console.log("[Incident] Crash reason response:\n", crashReason);

  // Clean up the response if it contains markdown code blocks
  let cleanReason = crashReason;
  const jsonMatch =
    cleanReason.match(/```json\n([\s\S]*?)\n```/) ||
    cleanReason.match(/```([\s\S]*?)```/);
  if (jsonMatch) {
    cleanReason = jsonMatch[1];
  }

  // Attempt to parse the JSON
  let crashReasonData;
  try {
    crashReasonData = JSON.parse(cleanReason);
  } catch (error) {
    console.error(
      "Failed to parse JSON directly. Attempting to sanitize control characters...",
      error.message,
    );
    const sanitized = cleanReason.replace(/[\u0000-\u001F]+/g, (match) => {
      if (match === "\n") return match;
      return "";
    });

    try {
      crashReasonData = JSON.parse(sanitized);
    } catch (e2) {
      // If standard parse fails, we can't do much without a better library.
      console.error("Critical JSON parse error. Raw response:", crashReason);
      throw new HttpError(500, "Failed to parse AI response: " + error.message);
    }
  }

  // 5. Summarize the commit history with Claude
  const slackReport = await generateSlackReport(appName, crashReasonData);
  sendSlackNotification(slackReport);
  return {
    success: true,
    message: "Incident processed",
  };
}

function getPromptForCrashReason(stacktrace) {
  return `${systemPrompt}
  The stack trace is: ${stacktrace}
  `;
}

function getFileNames(files) {
  return files.map((file) => {
    const fileName = file.replace(
      `/Users/moony/fourth_year/ICHACK/${app_name}/`,
      "",
    );
    return fileName;
  });
}

async function generateSlackReport(appName, crashReasonData) {
  const summary = crashReasonData.summary || "No summary provided";
  const files = getFileNames(crashReasonData.files) || [];

  const commitHistory = [];
  for (const file of files) {
    const history = await getTopCommitsWithDiffs(
      "yejin-angela-moon",
      "ichack26",
      file,
    );
    commitHistory.push(history);
  }

  try {
    const incidentId = crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString();
    const timestamp = new Date().toISOString();
    const repo = "ichack26/broken_app";
    const errorName = crashReasonData.errorType || "UnknownError";
    const errorMessage = crashReasonData.errorMessage || "Unknown error";
    // Use values provided by the AI instead of parsing stacktrace
    const topFrame = crashReasonData.topFrame || "Unknown frame";
    const lineCtx = crashReasonData.lineNumber || "0";

    // Use the first file identified by the AI as the primary file context
    let fileCtx = "";
    if (files.length > 0) {
      fileCtx = files[0];
    }

    let ownersString = "";
    if (fileCtx) {
      try {
        const ownersData = await getTopAuthorsForFile(
          "yejin-angela-moon",
          "ichack26",
          fileCtx,
        );
        if (ownersData && ownersData.topAuthors) {
          ownersString = ownersData.topAuthors
            .map((a) => `${a.author}:${a.commitCount}`)
            .join("|");
        }
      } catch (e) {
        console.log("Could not fetch owners for file: " + fileCtx);
      }
    }

    const flatCommits = commitHistory.flat();
    const commitListString = flatCommits
      .map((c) => {
        const title = c.message ? c.message.split("\n")[0] : "No message";
        return `${c.shortSha}:${title}@${c.author}`;
      })
      .join(";");

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return "";
      const s = String(str).replace(/"/g, '""');
      if (s.includes(",") || s.includes('"') || s.includes("\n"))
        return `"${s}"`;
      return s;
    };

    const csvRow = [
      incidentId,
      timestamp,
      repo,
      fileCtx,
      lineCtx,
      errorName,
      errorMessage,
      topFrame,
      ownersString,
      commitListString,
      summary,
    ]
      .map(escapeCsv)
      .join(",");

    const csvPath = path.join(__dirname, "../services/incidents.csv");
    if (!fs.existsSync(csvPath)) {
      const header =
        "incident_id,timestamp,repo,file,line,error_name,error_message,top_frame,owners_top3,commit_list,slack_text\n";
      fs.writeFileSync(csvPath, header);
    }
    fs.appendFileSync(csvPath, csvRow + "\n");
  } catch (err) {
    console.error("Failed to write to incidents.csv:", err);
  }

  // const commitHistoryOutput = commitHistory.flat();

  const claudeInterpretedHistory = await axios.post(`${BASE_URL}/chat`, {
    prompt: getPromptForInterpretedHistory(JSON.stringify(commitHistory)),
  });

  console.log("[Incident] Crash reason analysis:\n", crashReasonData);

  return `
  *──────── 🚨 Incident Report 🚨 ────────*
  *App Name*: ${appName}
  *Crash Summary*: ${summary}
  *Crash Report*: ${crashReasonData.crashReport}
  *Recent Commit History*: ${claudeInterpretedHistory.data.response}
  *─────────────────────────────────────--*
  `;
}

function getPromptForInterpretedHistory(commitHistoryOutput) {
  return `Given the following commit history and diffs, summarize the changes that might have led to the crash,
  Give your output in a list format, as a Slack message, where each entry has the commit message, author, 
  date, and a brief explanation of the changes in that commit.

  ${commitHistoryOutput}
  `;
}

module.exports = { processIncident: processIncident };
