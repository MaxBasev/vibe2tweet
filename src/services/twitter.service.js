const { TwitterApi } = require('twitter-api-v2');
const Logger = require('../utils/logger');
const config = require('../config/config');

class TwitterService {
    constructor() {
        this.clients = {};
        this._initializeClients();
    }

    _initializeClients() {
        if (this._hasCredentials(config.twitter.account1)) {
            this.clients.account1 = new TwitterApi({
                appKey: config.twitter.account1.appKey,
                appSecret: config.twitter.account1.appSecret,
                accessToken: config.twitter.account1.accessToken,
                accessSecret: config.twitter.account1.accessSecret,
            });
        }

        if (this._hasCredentials(config.twitter.account2)) {
            this.clients.account2 = new TwitterApi({
                appKey: config.twitter.account2.appKey,
                appSecret: config.twitter.account2.appSecret,
                accessToken: config.twitter.account2.accessToken,
                accessSecret: config.twitter.account2.accessSecret,
            });
        }
    }

    _hasCredentials(creds) {
        return creds.appKey && creds.appSecret && creds.accessToken && creds.accessSecret;
    }

    async postTweet(accountKey, text) {
        const clientWrapper = this.clients[accountKey];

        if (!clientWrapper) {
            throw new Error(`Twitter client for ${accountKey} is not configured.`);
        }

        try {
            Logger.info(`Posting tweet to ${accountKey}`);
            const tweet = await clientWrapper.v2.tweet(text);
            const tweetId = tweet.data.id;
            return `https://x.com/i/web/status/${tweetId}`;
        } catch (error) {
            Logger.error(`Failed to post to Twitter (${accountKey})`, error);
            throw error;
        }
    }
}

module.exports = new TwitterService();
