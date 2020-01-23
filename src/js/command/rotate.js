/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Rotate an image
 */
import snippet from 'tui-code-snippet';
import commandFactory from '../factory/command';
import consts from '../consts';

const {componentNames, commandNames} = consts;
const {ROTATION} = componentNames;

/**
 * Calculate undo angle
 * @param {string} type - execute type
 * @param {Component} rotationComp - rotation component
 * @returns {number} - angle for undo state
 */
function getUndoAngle(type, rotationComp) {
    let undoAngle = rotationComp.getCurrentAngle();

    if (type === 'setAngle') {
        undoAngle = rotationComp.lastAngleForUndoStack;
    }

    return undoAngle;
}

const command = {
    name: commandNames.ROTATE_IMAGE,

    /**
     * Rotate an image
     * @param {Graphics} graphics - Graphics instance
     * @param {string} type - 'rotate' or 'setAngle'
     * @param {number} angle - angle value (degree)
     * @param {boolean} isSilent - is silent execution or not
     * @returns {Promise}
     */
    execute(graphics, type, angle, isSilent) {
        const rotationComp = graphics.getComponent(ROTATION);

        if (!isSilent && !snippet.isExisty(this.undoData.angle)) {
            this.undoData.angle = getUndoAngle(type, rotationComp);
            rotationComp.lastAngleForUndoStack = angle;
        }

        return rotationComp[type](angle);
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const rotationComp = graphics.getComponent(ROTATION);
        const [, type, angle] = this.args;

        if (type === 'setAngle') {
            return rotationComp[type](this.undoData.angle);
        }

        return rotationComp.rotate(-angle);
    }
};

commandFactory.register(command);

module.exports = command;
