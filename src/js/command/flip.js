/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Flip an image
 */
import commandFactory from '../factory/command';
import consts from '../consts';

const {componentNames, commandNames} = consts;
const {FLIP} = componentNames;

const command = {
    name: commandNames.FLIP_IMAGE,

    /**
     * flip an image
     * @param {Graphics} graphics - Graphics instance
     * @param {string} type - 'flipX' or 'flipY' or 'reset'
     * @returns {Promise}
     */
    execute(graphics, type) {
        const flipComp = graphics.getComponent(FLIP);

        this.undoData.setting = flipComp.getCurrentSetting();

        return flipComp[type]();
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const flipComp = graphics.getComponent(FLIP);

        return flipComp.set(this.undoData.setting);
    }
};

commandFactory.register(command);

module.exports = command;
