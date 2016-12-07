/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Util
 */
const {min, max} = Math;

module.exports = {
    /**
     * Clamp value
     * @param {number} value - Value
     * @param {number} minValue - Minimum value
     * @param {number} maxValue - Maximum value
     * @returns {number} clamped value
     */
    clamp(value, minValue, maxValue) {
        let temp;
        if (minValue > maxValue) {
            temp = minValue;
            minValue = maxValue;
            maxValue = temp;
        }

        return max(minValue, min(value, maxValue));
    },

    /**
     * Make key-value object from arguments
     * @returns {object.<string, string>}
     */
    keyMirror(...args) {
        const obj = {};

        tui.util.forEach(args, key => {
            obj[key] = key;
        });

        return obj;
    },

    /**
     * Make CSSText
     * @param {object} styleObj - Style info object
     * @returns {string} Connected string of style
     */
    makeStyleText(styleObj) {
        let styleStr = '';

        tui.util.forEach(styleObj, (value, prop) => {
            styleStr += `${prop}: ${value};`;
        });

        return styleStr;
    }
};
