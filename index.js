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
        <title>Vibe2Tweet</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600&display=swap" rel="stylesheet">
        <style>
            body { 
                font-family: 'Outfit', sans-serif; 
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #2a1b3d 100%);
                color: #fff; 
                display: flex; 
                flex-direction: column;
                align-items: center; 
                justify-content: center; 
                height: 100vh; 
                margin: 0; 
                overflow: hidden;
            }
            .container {
                text-align: center;
                animation: fadeIn 1.5s ease-out;
            }
            h1 {
                font-size: 3.5rem;
                font-weight: 600;
                margin: 0;
                background: linear-gradient(to right, #a18cd1, #fbc2eb);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 10px 30px rgba(161, 140, 209, 0.3);
                letter-spacing: -1px;
            }
            p {
                font-size: 1.2rem;
                font-weight: 300;
                color: rgba(255, 255, 255, 0.6);
                margin-top: 10px;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            @keyframes fadeIn {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Vibe2Tweet</h1>
            <p>by MaxBasev</p>
        </div>
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
