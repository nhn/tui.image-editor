/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add an image object
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames} = consts;
const {MAIN} = componentNames;

const command = {
    name: 'addImageObject',

    /**
     * Add an image object on canvas
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} imgUrl - Image url to make object
     * @returns {Promise}
     */
    execute(compMap, imgUrl) {
        const mainComp = compMap[MAIN];
        const self = this;

        return mainComp.addImageObject(imgUrl).then(imgObj => {
            self.store = imgObj;
        });
    },
    /**
     * @returns {Promise}
     */
    undo() {
        this.store.remove();

        return Promise.resolve();
    }
};

module.exports = command;
