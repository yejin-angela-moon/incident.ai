const testRouter = require("./Test");
const gitHubRouter = require("./GitHub");

const apiRouter = require("express").Router();

apiRouter.use("/", testRouter);
apiRouter.use("/github", gitHubRouter);

module.exports = apiRouter;