/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Util
 */
import {forEach, imagePing} from 'tui-code-snippet';
const {min, max} = Math;
let hostnameSent = false;

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

        forEach(args, key => {
            obj[key] = key;
        });

        return obj;
    },

    /**
     * Make CSSText
     * @param {Object} styleObj - Style info object
     * @returns {string} Connected string of style
     */
    makeStyleText(styleObj) {
        let styleStr = '';

        forEach(styleObj, (value, prop) => {
            styleStr += `${prop}: ${value};`;
        });

        return styleStr;
    },

    /**
     * Get object's properties
     * @param {Object} obj - object
     * @param {Array} keys - keys
     * @returns {Object} properties object
     */
    getProperties(obj, keys) {
        const props = {};
        const {length} = keys;
        let i = 0;
        let key;

        for (i = 0; i < length; i += 1) {
            key = keys[i];
            props[key] = obj[key];
        }

        return props;
    },

    /**
     * Replace matched property with template
     * @param {string} template - String of template
     * @param {Object} propObj - Properties
     * @returns {string} Replaced template string
     */
    applyTemplate(template, propObj) {
        const newTemplate = template.replace(/\{\{(\w*)\}\}/g, (value, prop) => (
            propObj.hasOwnProperty(prop) ? propObj[prop] : ''
        ));

        return newTemplate;
    },

    /**
     * send hostname
     */
    sendHostName() {
        const {hostname} = location;
        if (hostnameSent) {
            return;
        }
        hostnameSent = true;

        imagePing('https://www.google-analytics.com/collect', {
            v: 1,
            t: 'event',
            tid: 'UA-115377265-9',
            cid: hostname,
            dp: hostname,
            dh: 'image-editor'
        });
    }
};
