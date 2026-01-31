const testRouter = require("./Test");
const chatRouter = require("./Chat");
const gitHubRouter = require("./GitHub");

const apiRouter = require("express").Router();

apiRouter.use("/", testRouter);
apiRouter.use("/github", gitHubRouter);
apiRouter.use("/chat", chatRouter);

module.exports = apiRouter;
