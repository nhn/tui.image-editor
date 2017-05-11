/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Resize a canvas
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames} = consts;
const {MAIN} = componentNames;

const command = {
    name: 'resizeCanvasDimension',

    /**
     * resize the canvas with given dimension
     * @param {object.<string, Component>} compMap - Components injection
     * @param {{width: number, height: number}} dimension - Max width & height
     * @returns {Promise}
     */
    execute(compMap, dimension) {
        return new Promise(resolve => {
            const mainComp = compMap[MAIN];

            this.store = {
                width: mainComp.cssMaxWidth,
                height: mainComp.cssMaxHeight
            };

            mainComp.setCssMaxDimension(dimension);
            mainComp.adjustCanvasDimension();
            resolve();
        });
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     */
    undo(compMap) {
        const mainComp = compMap[MAIN];

        mainComp.setCssMaxDimension(this.store);
        mainComp.adjustCanvasDimension();

        return Promise.resolve();
    }
};

module.exports = command;
