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
     * hex to rgb
     * @param {string} color - hex color
     * @param {string} alpha - color alpha value
     * @returns {string} rgb expression
     */
    getRgb(color, alpha) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const a = alpha || 1;

        return `rgba(${r}, ${g}, ${b}, ${a})`;
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
    },

    /**
     * Get selector
     * @param {HTMLElement} targetElement - target element
     * @returns {Function} selector
     */
    getSelector(targetElement) {
        return str => targetElement.querySelector(str);
    },

    /**
     * Change base64 to blob
     * @param {String} data - base64 string data
     * @returns {Blob} Blob Data
     */
    base64ToBlob(data) {
        const rImageType = /data:(image\/.+);base64,/;
        let mimeString = '';
        let raw, uInt8Array, i;

        raw = data.replace(rImageType, (header, imageType) => {
            mimeString = imageType;

            return '';
        });

        raw = atob(raw);
        const rawLength = raw.length;
        uInt8Array = new Uint8Array(rawLength); // eslint-disable-line

        for (i = 0; i < rawLength; i += 1) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], {type: mimeString});
    }
};
