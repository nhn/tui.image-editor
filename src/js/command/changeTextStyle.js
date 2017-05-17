/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Change text styles
 */
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, rejectMessages, commandNames} = consts;
const {TEXT} = componentNames;

const command = {
    name: commandNames.CHANGE_TEXT_STYLE,

    /**
     * Change text styles
     * @param {Graphics} graphics - Graphics instance
     * @param {Object} styles - text styles
     *     @param {string} [styles.fill] Color
     *     @param {string} [styles.fontFamily] Font type for text
     *     @param {number} [styles.fontSize] Size
     *     @param {string} [styles.fontStyle] Type of inclination (normal / italic)
     *     @param {string} [styles.fontWeight] Type of thicker or thinner looking (normal / bold)
     *     @param {string} [styles.textAlign] Type of text align (left / center / right)
     *     @param {string} [styles.textDecoraiton] Type of line (underline / line-throgh / overline)
     * @returns {Promise}
     */
    execute(graphics, styles) {
        const textComp = graphics.getComponent(TEXT);
        const activeObj = graphics.getActiveObject();
        const undoData = this.undoData;

        if (!activeObj) {
            return Promise.reject(rejectMessages.noActiveObject);
        }

        undoData.object = activeObj;
        undoData.styles = {};
        tui.util.forEachOwnProperties(styles, (value, key) => {
            undoData.styles[key] = activeObj[key];
        });

        return textComp.setStyle(activeObj, styles);
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const textComp = graphics.getComponent(TEXT);
        const textObj = this.undoData.object;
        const styles = this.undoData.styles;

        return textComp.setStyle(textObj, styles);
    }
};

commandFactory.register(command);

module.exports = command;
