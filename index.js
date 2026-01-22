const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./src/config/config');
const Logger = require('./src/utils/logger');
const BotHandler = require('./src/bot/handlers');

const app = express();
app.use(express.json());

const bot = new TelegramBot(config.telegram.token);
const botHandler = new BotHandler(bot);

app.post('/webhook', async (req, res) => {
    try {
        const update = req.body;

        if (update.message) {
            await botHandler.handleMessage(update.message);
        } else if (update.callback_query) {
            await botHandler.handleCallback(update.callback_query);
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        Logger.error('Webhook processing error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Status</title>
        <style>
          body { font-family: sans-serif; background: #111; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .badge { padding: 10px 20px; background: #28a745; border-radius: 4px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="badge">System Operational</div>
    </body>
    </html>
  `);
});

app.listen(config.app.port, () => {
    Logger.info(`Server running on port ${config.app.port} in ${config.app.nodeEnv} mode`);
});

process.on('SIGTERM', () => {
    Logger.info('SIGTERM received, shutting down...');
    process.exit(0);
});
