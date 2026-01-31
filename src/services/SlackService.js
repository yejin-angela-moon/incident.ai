const { IncomingWebhook } = require("@slack/webhook");

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

async function sendSlackNotification(message) {
  await webhook.send({
    text: `New notification`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
    ],
  });
}

module.exports = {
  sendSlackNotification,
};
