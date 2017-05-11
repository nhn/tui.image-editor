/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add a shape
 */
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames} = consts;
const {SHAPE} = componentNames;

const command = {
    name: 'addShape',

    /**
     * Add a shape
     * @param {object.<string, Component>} compMap - Components injection
     * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
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
    execute(compMap, type, options) {
        const shapeComp = compMap[SHAPE];
        const self = this;

        return shapeComp.add(type, options).then(shape => {
            self.store = shape;
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
