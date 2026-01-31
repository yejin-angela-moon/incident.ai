const express = require("express");
const { addRequestId, errorHandler } = require("./middleware/Logs");
const { HttpError } = require("./util/HttpError");
const apiRouter = require("./routes/Api");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Assigns a unique request ID to each request
app.use(addRequestId);

app.get("/", (req, res) => {
  res.send("Backend working.");
});

app.use("/api", apiRouter);

// Unknown route handler
app.use((req, res, next) => {
  next(new HttpError(404, `Route ${req.originalUrl} not found`));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
