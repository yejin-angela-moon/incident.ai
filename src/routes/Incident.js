const express = require("express");
const { logIncident } = require("../controllers/IncidentController");

const incidentRouter = express.Router();

/**
 * POST /api/incident
 * Receives a stacktrace string in the body and logs it
 *
 * Body: { stacktrace: string }
 */
incidentRouter.post("/", (req, res, next) => {
  try {
    const { stacktrace } = req.body;
    const result = logIncident(stacktrace);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = incidentRouter;
