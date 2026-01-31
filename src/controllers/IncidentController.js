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

  return { success: true, message: "Stacktrace logged" };
}

module.exports = { logIncident: processIncident };
