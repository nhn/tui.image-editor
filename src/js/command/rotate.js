/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Rotate an image
 */
import commandFactory from '../factory/command';
import consts from '../consts';

const {componentNames, commandNames} = consts;
const {ROTATION} = componentNames;

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

        if (!isSilent) {
            this.undoData.angle = rotationComp.getCurrentAngle();
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
