/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Change text styles
 */
import snippet from 'tui-code-snippet';
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, rejectMessages, commandNames} = consts;
const {TEXT} = componentNames;

/**
 * Calculate undo fontSize
 * @param {Component} textComp - text component
 * @returns {number} - angle for undo state
 */
function getUndoFontSize(textComp) {
    return textComp.lastfontSizeUndoStack;
}

const command = {
    name: commandNames.CHANGE_TEXT_STYLE,

    /**
     * Change text styles
     * @param {Graphics} graphics - Graphics instance
     * @param {number} id - object id
     * @param {Object} styles - text styles
     *     @param {string} [styles.fill] Color
     *     @param {string} [styles.fontFamily] Font type for text
     *     @param {number} [styles.fontSize] Size
     *     @param {string} [styles.fontStyle] Type of inclination (normal / italic)
     *     @param {string} [styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *     @param {string} [styles.textAlign] Type of text align (left / center / right)
     *     @param {string} [styles.textDecoration] Type of line (underline / line-through / overline)
     * @param {boolean} isSilent - is silent execution or not
     * @returns {Promise}
     */
    execute(graphics, id, styles, isSilent) {
        const textComp = graphics.getComponent(TEXT);
        const targetObj = graphics.getObject(id);

        if (!targetObj) {
            return Promise.reject(rejectMessages.noObject);
        }

        this.undoData.object = targetObj;
        this.undoData.styles = {};
        snippet.forEachOwnProperties(styles, (value, key) => {
            let undoValue = targetObj[key];

            if (!isSilent && !snippet.isExisty(this.undoData.styles[key])) {
                undoValue = textComp.lastfontSizeUndoStack;
                textComp.lastfontSizeUndoStack = targetObj[key];
                this.undoData.styles[key] = undoValue;
            } else {
                this.undoData.styles[key] = undoValue;
            }
        });

        if (styles.fontSize && styles.fontSize === targetObj.fontSize) {
            delete styles.fontSize;
        }

        return textComp.setStyle(targetObj, styles);
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const textComp = graphics.getComponent(TEXT);
        const {object: textObj, styles} = this.undoData;

        return textComp.setStyle(textObj, styles);
    }
};

commandFactory.register(command);

module.exports = command;
