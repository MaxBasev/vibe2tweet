class Logger {
    static info(message, meta = {}) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    }

    static error(message, error) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ? `\n${error.stack || error}` : '');
    }

    static warn(message, meta = {}) {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
    }

    static debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
        }
    }
}

module.exports = Logger;
