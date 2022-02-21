/**
 * Translate messages
 */
class Locale {
  constructor(locale) {
    const newLocale = {};

    for (const key in locale) {
      if (Object.prototype.hasOwnProperty.call(locale, key)) {
        newLocale[key.toUpperCase()] = locale[key];
      }
    }

    this._locale = newLocale;
  }

  /**
   * localize message
   * @param {string} message - message who will be localized
   * @returns {string}
   */
  localize(message) {
    return this._locale[message.toString().toUpperCase()] || message;
  }
}

export default Locale;
