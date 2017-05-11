/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Remove an object
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames} = consts;
const {MAIN} = componentNames;

const command = {
    name: 'removeObject',

    /**
     * Remove an object
     * @param {object.<string, Component>} compMap - Components injection
     * @param {Object} target - Fabric object
     * @returns {Promise}
     */
    execute(compMap, target) {
        return new Promise((resolve, reject) => {
            const canvas = compMap[MAIN].getCanvas();
            const isValidGroup = target && target.isType('group') && !target.isEmpty();

            if (isValidGroup) {
                canvas.discardActiveGroup(); // restore states for each objects
                this.store = target.getObjects();
                target.forEachObject(obj => {
                    obj.remove();
                });
                resolve();
            } else if (canvas.contains(target)) {
                this.store = [target];
                target.remove();
                resolve();
            } else {
                reject();
            }
        });
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     */
    undo(compMap) {
        const canvas = compMap[MAIN].getCanvas();
        const canvasContext = canvas;

        canvas.add.apply(canvasContext, this.store);

        return Promise.resolve();
    }
};

module.exports = command;
