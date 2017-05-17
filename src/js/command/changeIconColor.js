/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Change icon color
 */
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, rejectMessages, commandNames} = consts;
const {ICON} = componentNames;

const command = {
    name: commandNames.CHANGE_ICON_COLOR,

    /**
     * Change icon color
     * @param {Graphics} graphics - Graphics instance
     * @param {string} color - Color for icon
     * @returns {Promise}
     */
    execute(graphics, color) {
        return new Promise((resolve, reject) => {
            const iconComp = graphics.getComponent(ICON);
            const activeObj = graphics.getActiveObject();

            if (!activeObj) {
                reject(rejectMessages.noActiveObject);
            }

            this.undoData.object = activeObj;
            this.undoData.color = iconComp.getColor(activeObj);
            iconComp.setColor(color, activeObj);
            resolve();
        });
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const iconComp = graphics.getComponent(ICON);
        const icon = this.undoData.object;
        const color = this.undoData.color;

        iconComp.setColor(color, icon);

        return Promise.resolve();
    }
};

commandFactory.register(command);

module.exports = command;
