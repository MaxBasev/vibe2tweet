require('dotenv').config();
const Logger = require('../utils/logger');

const requiredEnvVars = [
    'TELEGRAM_BOT_TOKEN',
    'OPENAI_API_KEY',
    'ALLOWED_USER_ID',
];

const validateEnv = () => {
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        Logger.error(`Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }
};

validateEnv();

module.exports = {
    app: {
        port: process.env.PORT || 3000,
        webhookSecret: process.env.WEBHOOK_SECRET,
        allowedUserId: parseInt(process.env.ALLOWED_USER_ID, 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    telegram: {
        token: process.env.TELEGRAM_BOT_TOKEN,
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    twitter: {
        account1: {
            appKey: process.env.TWITTER_API_KEY_1,
            appSecret: process.env.TWITTER_API_KEY_SECRET_1,
            accessToken: process.env.TWITTER_ACCESS_TOKEN_1,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET_1,
            name: process.env.TWITTER_ACCOUNT_NAME_1 || 'Account 1',
            handle: process.env.TWITTER_ACCOUNT_HANDLE_1,
            channelId: process.env.TELEGRAM_CHANNEL_ID_1,
        },
        account2: {
            appKey: process.env.TWITTER_API_KEY_2,
            appSecret: process.env.TWITTER_API_KEY_SECRET_2,
            accessToken: process.env.TWITTER_ACCESS_TOKEN_2,
            accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET_2,
            name: process.env.TWITTER_ACCOUNT_NAME_2 || 'Account 2',
            handle: process.env.TWITTER_ACCOUNT_HANDLE_2,
            channelId: process.env.TELEGRAM_CHANNEL_ID_2,
        },
    },
};
