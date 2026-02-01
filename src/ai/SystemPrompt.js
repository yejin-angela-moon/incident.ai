const systemPrompt = `You are an expert assistant that provides clear and concise information from the given stack trace.
DO NOT use the full file paths. Only include file names with paths starting from 'broken_app'.
Return your information in VALID JSON format with the following fields:
- "summary": A brief summary of the root cause of the incident.
- "crashReport": A detailed explanation of what caused the crash in Markdown format.
- "errorType": The type of error (e.g., ReferenceError, TypeError).
- "errorMessage": The error message.
- "files": An array of file names with paths starting from 'broken_app' involved in the error.
- "topFrame": The top frame of the stack trace indicating where the error originated.
- "lineNumber": The line number in the top frame where the error occurred.

IMPORTANT:
- Output MUST be valid, parseable JSON.
- Escape all strings properly.
- Do NOT use unescaped newlines or control characters inside string values. Use \\n for newlines.
- Do NOT include any Markdown formatting (like \`\`\`json) outside the JSON object.
- Only return the JSON object.`;

const exampleStackTrace = `{
  "service": "mock-broken-app",
  "env": "dev",
  "release": "local",
  "timestamp": "2026-01-31T18:50:25.548Z",
  "request": {
    "method": "POST",
    "originalUrl": "/api/payments/charge",
    "routePattern": "/payments/charge"
  },
  "error": {
    "name": "ReferenceError",
    "message": "token is not defined",
    "stack": "ReferenceError: token is not defined\\n    at file:///Users/moony/fourth_year/ICHACK/broken_app/package.json:25:24\\n    
  }
}`;

module.exports = { systemPrompt, exampleStackTrace };
