/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Change a text
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, rejectMessages} = consts;
const {TEXT} = componentNames;

const command = {
    name: 'changeText',

    /**
     * Change a text
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} text - Changing text
     * @returns {Promise}
     */
    execute(compMap, text) {
        const textComp = compMap[TEXT];
        const canvas = textComp.getCanvas();
        const activeObj = canvas.getActiveObject();

        if (!activeObj) {
            return Promise.reject(rejectMessages.noActiveObject);
        }

        this.storeObj = activeObj;
        this.store = textComp.getText(activeObj);

        return textComp.change(activeObj, text);
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     */
    undo(compMap) {
        const textComp = compMap[TEXT];

        return textComp.change(this.storeObj, this.store);
    }
};

module.exports = command;
