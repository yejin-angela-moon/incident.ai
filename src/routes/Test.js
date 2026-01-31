const { HttpError } = require("../util/HttpError");

const testRouter = require("express").Router();

testRouter.get("/test", (req, res) => {
  res.json({ message: "This is a test endpoint." });
});

testRouter.get("/throw", (req, res) => {
  throw new HttpError(400, "This is a test error.");
});

testRouter.get("/async-throw", async (req, res, next) => {
  throw new HttpError(500, "This is an async test error.");
});

testRouter.get("/env", (req, res) => {
  res.json({ testVar: process.env.TEST_VAR || "Cannot find TEST_VAR" });
});

module.exports = testRouter;