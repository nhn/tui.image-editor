/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Clear all objects
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames} = consts;
const {MAIN} = componentNames;

const command = {
    name: 'clearObjects',

    /**
     * Clear all objects on canvas
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     */
    execute(compMap) {
        return new Promise((resolve, reject) => {
            const canvas = compMap[MAIN].getCanvas();
            const objs = canvas.getObjects();

            // Slice: "canvas.clear()" clears the objects array, So shallow copy the array
            this.store = objs.slice();
            if (this.store.length) {
                tui.util.forEach(objs.slice(), obj => {
                    obj.remove();
                });
                resolve();
            } else {
                reject();
            }
        });
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     * @ignore
     */
    undo(compMap) {
        const canvas = compMap[MAIN].getCanvas();
        const canvasContext = canvas;

        canvas.add.apply(canvasContext, this.store);

        return Promise.resolve();
    }
};

module.exports = command;
