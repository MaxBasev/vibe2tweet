const Logger = require('../utils/logger');
const Constants = require('../config/constants');
const config = require('../config/config');
const openAIService = require('../services/openai.service');
const twitterService = require('../services/twitter.service');

const PROMPTS = require('../config/prompts');

class BotHandler {
    constructor(botInstance) {
        this.bot = botInstance;
        this.sessions = new Map();
    }

    async handleMessage(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        if (userId !== config.app.allowedUserId) {
            Logger.warn(`Unauthorized access attempt from user ID: ${userId}`);
            return;
        }

        if (msg.text === Constants.COMMANDS.START) {
            return this._sendWelcome(chatId);
        }

        if (this._shouldIgnore(msg)) return;

        const uniqueId = `${chatId}_${Date.now()}`;
        this.sessions.set(uniqueId, {
            originalText: msg.text,
            timestamp: Date.now(),
        });

        setTimeout(() => this.sessions.delete(uniqueId), Constants.SESSION_TTL_MS);

        await this._promptAccountSelection(chatId, msg.text, uniqueId);
    }

    async handleCallback(callbackQuery) {
        const chatId = callbackQuery.message.chat.id;
        const userId = callbackQuery.from.id;
        const data = callbackQuery.data;

        if (userId !== config.app.allowedUserId) return;

        await this.bot.answerCallbackQuery(callbackQuery.id);

        try {
            if (data.includes(Constants.CALLBACKS.TRANSLATE_ACCOUNT_1) || data.includes(Constants.CALLBACKS.TRANSLATE_ACCOUNT_2)) {
                await this._handleTranslationRequest(chatId, data);
            } else if (data.includes(Constants.CALLBACKS.SELECT_VARIANT)) {
                await this._handleVariantSelection(chatId, data);
            } else if (data.includes(Constants.CALLBACKS.POST)) {
                await this._handlePost(chatId, data);
            } else if (data.includes(Constants.CALLBACKS.CANCEL)) {
                await this._handleCancel(chatId, data);
            }
        } catch (err) {
            Logger.error('Error handling callback', err);
            this.bot.sendMessage(chatId, Constants.ERRORS.GENERIC);
        }
    }

    _shouldIgnore(msg) {
        if (!msg.text) return true;
        if (msg.text.startsWith('/')) return true;
        if (msg.text.length > 10000) {
            this.bot.sendMessage(msg.chat.id, Constants.ERRORS.MSG_TOO_LONG);
            return true;
        }
        return false;
    }

    async _sendWelcome(chatId) {
        await this.bot.sendMessage(chatId, `Hello! 👋\n\nSend me text in your native language, and I will translate it tailored to your Twitter persona.`);
    }

    async _promptAccountSelection(chatId, text, uniqueId) {
        const keyboard = {
            inline_keyboard: [
                [{ text: `📱 ${config.twitter.account1.name}`, callback_data: `${Constants.CALLBACKS.TRANSLATE_ACCOUNT_1}${uniqueId}` }],
                [{ text: `📱 ${config.twitter.account2.name}`, callback_data: `${Constants.CALLBACKS.TRANSLATE_ACCOUNT_2}${uniqueId}` }],
                [{ text: '❌ Cancel', callback_data: `${Constants.CALLBACKS.CANCEL}${uniqueId}` }]
            ]
        };

        await this.bot.sendMessage(chatId, `📝 **Select Account/Style:**\n\n"${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async _handleTranslationRequest(chatId, data) {
        const isAccount1 = data.startsWith(Constants.CALLBACKS.TRANSLATE_ACCOUNT_1);
        const uniqueId = data.replace(isAccount1 ? Constants.CALLBACKS.TRANSLATE_ACCOUNT_1 : Constants.CALLBACKS.TRANSLATE_ACCOUNT_2, '');
        const session = this.sessions.get(uniqueId);

        if (!session) return this.bot.sendMessage(chatId, Constants.ERRORS.SESSION_EXPIRED);

        const accountConfig = isAccount1 ? config.twitter.account1 : config.twitter.account2;
        const prompt = isAccount1 ? PROMPTS.style1 : PROMPTS.style2;

        await this.bot.sendMessage(chatId, `🔄 Generating options for ${accountConfig.name}...`);

        const variants = await openAIService.generateTranslations(session.originalText, prompt);
        const validVariants = variants.filter(v => v.length <= Constants.TWITTER_MAX_LENGTH);

        if (validVariants.length === 0) {
            return this.bot.sendMessage(chatId, Constants.ERRORS.ALL_VARIANTS_TOO_LONG);
        }

        session.variants = validVariants;
        session.selectedAccountKey = isAccount1 ? 'account1' : 'account2';
        this.sessions.set(uniqueId, session);

        const variantButtons = validVariants.map((variant, index) => [
            { text: `${index + 1}. ${variant.substring(0, 30)}...`, callback_data: `${Constants.CALLBACKS.SELECT_VARIANT}${index}_${uniqueId}` }
        ]);

        variantButtons.push([{ text: '❌ Cancel', callback_data: `${Constants.CALLBACKS.CANCEL}${uniqueId}` }]);

        let msgText = `📝 Choose version for ${accountConfig.name}:\n\n`;
        validVariants.forEach((v, i) => msgText += `${i + 1}. ${v}\n📊 ${v.length}/${Constants.TWITTER_MAX_LENGTH}\n\n`);

        await this.bot.sendMessage(chatId, msgText, { reply_markup: { inline_keyboard: variantButtons } });
    }

    async _handleVariantSelection(chatId, data) {
        const parts = data.split('_');
        const variantIndex = parseInt(parts[2]);
        const uniqueId = parts.slice(3).join('_');
        const session = this.sessions.get(uniqueId);

        if (!session || !session.variants) return this.bot.sendMessage(chatId, Constants.ERRORS.SESSION_EXPIRED);

        const selectedVariant = session.variants[variantIndex];
        if (!selectedVariant) return this.bot.sendMessage(chatId, Constants.ERRORS.VARIANT_NOT_FOUND);

        session.finalText = selectedVariant;
        this.sessions.set(uniqueId, session);

        const accountName = config.twitter[session.selectedAccountKey].name;

        await this.bot.sendMessage(chatId, `✅ Selected Option ${variantIndex + 1}:\n\n${selectedVariant}`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `✅ Post to ${accountName}`, callback_data: `${Constants.CALLBACKS.POST}${uniqueId}` }],
                    [{ text: '❌ Cancel', callback_data: `${Constants.CALLBACKS.CANCEL}${uniqueId}` }]
                ]
            }
        });
    }

    async _handlePost(chatId, data) {
        const uniqueId = data.replace(Constants.CALLBACKS.POST, '');
        const session = this.sessions.get(uniqueId);

        if (!session || !session.finalText) return this.bot.sendMessage(chatId, Constants.ERRORS.SESSION_EXPIRED);

        const accountKey = session.selectedAccountKey;
        const accountConfig = config.twitter[accountKey];

        await this.bot.sendMessage(chatId, `📤 Posting...`);

        try {
            const tweetUrl = await twitterService.postTweet(accountKey, session.finalText);
            let successMsg = `✅ **Posted!**\n\n🔗 [Link to Tweet](${tweetUrl})`;

            if (accountConfig.channelId) {
                try {
                    await this.bot.sendMessage(accountConfig.channelId, `New Tweet:\n\n${session.finalText}\n\n${tweetUrl}`);
                    successMsg += `\n📢 Channel: Sent`;
                } catch (e) {
                    Logger.error('Telegram crosspost failed', e);
                    successMsg += `\n📢 Channel: Failed`;
                }
            }

            await this.bot.sendMessage(chatId, successMsg, { parse_mode: 'Markdown', disable_web_page_preview: false });
            this.sessions.delete(uniqueId);

        } catch (e) {
            this.bot.sendMessage(chatId, Constants.ERRORS.TWITTER_POST_ERROR + ` ${e.message}`);
        }
    }

    async _handleCancel(chatId, data) {
        const uniqueId = data.replace(Constants.CALLBACKS.CANCEL, '');
        this.sessions.delete(uniqueId);
        await this.bot.sendMessage(chatId, '❌ Cancelled');
    }
}

module.exports = BotHandler;
