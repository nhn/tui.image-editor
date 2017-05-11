/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Change icon color
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, rejectMessages} = consts;
const {ICON} = componentNames;

const command = {
    name: 'changeIconColor',

    /**
     * Change icon color
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} color - Color for icon
     * @returns {Promise}
     */
    execute(compMap, color) {
        return new Promise((resolve, reject) => {
            const iconComp = compMap[ICON];
            const canvas = iconComp.getCanvas();
            const activeObj = canvas.getActiveObject();

            if (!activeObj) {
                reject(rejectMessages.noActiveObject);
            }

            this.storeObj = activeObj;
            this.store = iconComp.getColor(activeObj);
            iconComp.setColor(color, activeObj);
            resolve();
        });
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     */
    undo(compMap) {
        const iconComp = compMap[ICON];

        iconComp.setColor(this.store, this.storeObj);

        return Promise.resolve();
    }
};

module.exports = command;
