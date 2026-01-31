const testRouter = require("./Test");
const chatRouter = require("./Chat");

const apiRouter = require("express").Router();

apiRouter.use("/", testRouter);
apiRouter.use("/chat", chatRouter);

module.exports = apiRouter;
