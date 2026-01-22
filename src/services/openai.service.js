const OpenAI = require('openai');
const Logger = require('../utils/logger');
const config = require('../config/config');

class OpenAIService {
    constructor() {
        this.client = new OpenAI({
            apiKey: config.openai.apiKey,
        });
    }

    async generateTranslations(text, systemPrompt) {
        try {
            Logger.debug('Sending request to OpenAI', { textLength: text.length });

            const completion = await this.client.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: `Original Text:\n${text}\n\nNotes:\n- Respect X's 280-character limit.\n- Provide exactly 3 different translation variants, each on a new line.\n- Format: "1. [first variant]\n2. [second variant]\n3. [third variant]"`
                    }
                ],
                max_tokens: 1500,
                temperature: 0.8
            });

            const responseContent = completion.choices[0].message.content.trim();
            return this._parseVariants(responseContent);

        } catch (error) {
            Logger.error('OpenAI generation failed', error);
            throw error;
        }
    }

    _parseVariants(rawText) {
        const variants = [];
        const lines = rawText.split('\n').filter(line => line.trim());

        for (const line of lines) {
            const match = line.match(/^(\d+)\.\s*(.+)$/);
            if (match && variants.length < 3) {
                variants.push(match[2].trim());
            }
        }

        if (variants.length === 0 && rawText.length > 0) {
            Logger.warn('Failed to parse specific variants, returning raw text');
            variants.push(rawText);
        }

        return variants;
    }
}

module.exports = new OpenAIService();
