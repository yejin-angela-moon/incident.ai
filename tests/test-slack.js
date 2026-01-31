require("dotenv").config();
const { sendSlackNotification } = require("../src/services/slackService");

async function test() {
  try {
    await sendSlackNotification(
      "*Test message* :wave:\nSent from Express app!",
    );
    console.log("Message sent successfully!");
  } catch (error) {
    console.error("Failed to send:", error.message);
  }
}

test();
