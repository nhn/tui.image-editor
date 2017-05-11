/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview change a shape
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, rejectMessages} = consts;
const {SHAPE} = componentNames;

const command = {
    name: 'changeShape',

    /**
     * Change a shape
     * @param {object.<string, Component>} compMap - Components injection
     * @param {object} options - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stroke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     *      @param {number} [options.left] - Shape x position
     *      @param {number} [options.top] - Shape y position
     *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
     * @returns {Promise}
     */
    execute(compMap, options) {
        const shapeComp = compMap[SHAPE];
        const canvas = shapeComp.getCanvas();
        const activeObj = canvas.getActiveObject();

        if (!activeObj) {
            return Promise.reject(rejectMessages.noActiveObject);
        }

        this.storeObj = activeObj;
        this.store = {};
        tui.util.forEachOwnProperties(options, (value, key) => {
            this.store[key] = activeObj[key];
        });

        return shapeComp.change(activeObj, options);
    },
    /**
     * @param {object.<string, Component>} compMap - Components injection
     * @returns {Promise}
     */
    undo(compMap) {
        const shapeComp = compMap[SHAPE];

        return shapeComp.change(this.storeObj, this.store);
    }
};

module.exports = command;
