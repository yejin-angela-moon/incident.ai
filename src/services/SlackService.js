const express = require('express');
const { IncomingWebhook } = require('@slack/webhook');

const app = express();
app.use(express.json());

// Initialize the webhook with your URL
const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

// Example: Send to Slack on a POST event
app.post('/api/order', async (req, res) => {
  try {
    // Your business logic here...

    // Send notification to Slack
    await webhook.send({
      text: `New order received! Order ID: ${req.body.orderId}`,
      // Optional: Rich formatting with blocks
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*New Order* :package:\nOrder ID: \`${req.body.orderId}\`\nAmount: $${req.body.amount}`,
          },
        },
      ],
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending to Slack:', error);
    res.status(500).json({ error: 'Failed to process' });
  }
});

app.listen(3000);
