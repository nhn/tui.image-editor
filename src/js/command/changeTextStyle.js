/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Change text styles
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, rejectMessages} = consts;
const {TEXT} = componentNames;

const command = {
    name: 'changeTextStyle',

    /**
     * Change text styles
     * @param {object.<string, Component>} compMap - Components injection
     * @param {object} styleObj - text styles
     *     @param {string} [styleObj.fill] Color
     *     @param {string} [styleObj.fontFamily] Font type for text
     *     @param {number} [styleObj.fontSize] Size
     *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
     *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
     *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
     *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
     * @returns {Promise}
     */
    execute(compMap, styleObj) {
        const textComp = compMap[TEXT];
        const canvas = textComp.getCanvas();
        const activeObj = canvas.getActiveObject();

        if (!activeObj) {
            return Promise.reject(rejectMessages.noActiveObject);
        }

        this.storeObj = activeObj;
        this.store = {};
        tui.util.forEachOwnProperties(styleObj, (value, key) => {
            this.store[key] = activeObj[key];
        });

        return textComp.setStyle(activeObj, styleObj);
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     */
    undo(compMap) {
        const textComp = compMap[TEXT];

        return textComp.setStyle(this.storeObj, this.store);
    }
};

module.exports = command;
