/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Rotate an image
 */
import consts from '../consts';

const {componentNames} = consts;
const {ROTATION} = componentNames;

const command = {
    name: 'rotate',

    /**
     * Rotate an image
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} type - 'rotate' or 'setAngle'
     * @param {number} angle - angle value (degree)
     * @returns {Promise}
     */
    execute(compMap, type, angle) {
        const rotationComp = compMap[ROTATION];

        this.store = rotationComp.getCurrentAngle();

        return rotationComp[type](angle);
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     */
    undo(compMap) {
        const rotationComp = compMap[ROTATION];

        return rotationComp.setAngle(this.store);
    }
};

module.exports = command;
