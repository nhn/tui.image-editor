/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add an object
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames} = consts;
const {MAIN} = componentNames;

const command = {
    name: 'addObject',

    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @param {Object} object - Fabric object
     * @returns {Promise}
     */
    execute(compMap, object) {
        tui.util.stamp(object);

        return new Promise((resolve, reject) => {
            const canvas = compMap[MAIN].getCanvas();

            if (!canvas.contains(object)) {
                canvas.add(object);
                canvas.setActiveObject(object);
                resolve(object);
            } else {
                reject();
            }
        });
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @param {Object} object - Fabric object
     * @returns {Promise}
     */
    undo(compMap, object) {
        return new Promise((resolve, reject) => {
            const canvas = compMap[MAIN].getCanvas();

            if (canvas.contains(object)) {
                canvas.remove(object);
                resolve(object);
            } else {
                reject();
            }
        });
    }
};

module.exports = command;
