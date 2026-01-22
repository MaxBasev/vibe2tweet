module.exports = {
    TWITTER_MAX_LENGTH: 280,
    SESSION_TTL_MS: 2 * 60 * 1000,

    COMMANDS: {
        START: '/start',
    },

    CALLBACKS: {
        TRANSLATE_ACCOUNT_1: 'translate_account1_',
        TRANSLATE_ACCOUNT_2: 'translate_account2_',
        SELECT_VARIANT: 'select_variant_',
        POST: 'post_',
        CANCEL: 'cancel_',
    },

    ERRORS: {
        MSG_TOO_LONG: 'Message too long. Maximum 10,000 characters allowed.',
        SESSION_EXPIRED: 'Session expired or not found. Please try again.',
        GENERIC: 'An error occurred. Please try again later.',
        VARIANT_NOT_FOUND: 'Selected variant not found.',
        ALL_VARIANTS_TOO_LONG: 'All generated variants exceeded the character limit. Please shorten your original text.',
        TWITTER_POST_ERROR: 'Failed to post tweet.',
    }
};
