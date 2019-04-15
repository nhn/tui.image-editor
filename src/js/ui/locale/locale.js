/**
 * Translate messages
 */
class Locale {
    /**
     * @constructor
     * @param {Object} locale - Locale object for initialise
     */
    constructor(locale) {
        this._locale = locale;
    }

    /**
     * localize message
     * @param {string} message - message who will be localized
     * @returns {string}
     */
    localize(message) {
        return this._locale[message] || message;
    }
}

export default Locale;
