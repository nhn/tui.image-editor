/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Change a text
 */
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, rejectMessages, commandNames} = consts;
const {TEXT} = componentNames;

const command = {
    name: commandNames.CHANGE_TEXT,

    /**
     * Change a text
     * @param {Graphics} graphics - Graphics instance
     * @param {string} text - Changing text
     * @returns {Promise}
     */
    execute(graphics, text) {
        const textComp = graphics.getComponent(TEXT);
        const activeObj = graphics.getActiveObject();
        const undoData = this.undoData;

        if (!activeObj) {
            return Promise.reject(rejectMessages.noActiveObject);
        }

        undoData.object = activeObj;
        undoData.text = textComp.getText(activeObj);

        return textComp.change(activeObj, text);
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const textComp = graphics.getComponent(TEXT);
        const textObj = this.undoData.object;
        const text = this.undoData.text;

        return textComp.change(textObj, text);
    }
};

commandFactory.register(command);

module.exports = command;
