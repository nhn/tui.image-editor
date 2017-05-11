/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Flip an image
 */
import consts from '../consts';

const {componentNames} = consts;
const {FLIP} = componentNames;

const command = {
    name: 'flip',

    /**
     * flip an image
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} type - 'flipX' or 'flipY' or 'reset'
     * @returns {Promise}
     */
    execute(compMap, type) {
        const flipComp = compMap[FLIP];

        this.store = flipComp.getCurrentSetting();

        return flipComp[type]();
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     */
    undo(compMap) {
        const flipComp = compMap[FLIP];

        return flipComp.set(this.store);
    }
};

module.exports = command;
