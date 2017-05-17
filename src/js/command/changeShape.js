/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview change a shape
 */
import commandFactory from '../factory/command';
import Promise from 'core-js/library/es6/promise';
import consts from '../consts';

const {componentNames, rejectMessages, commandNames} = consts;
const {SHAPE} = componentNames;

const command = {
    name: commandNames.CHANGE_SHAPE,

    /**
     * Change a shape
     * @param {Graphics} graphics - Graphics instance
     * @param {Object} options - Shape options
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
    execute(graphics, options) {
        const shapeComp = graphics.getComponent(SHAPE);
        const activeObj = graphics.getActiveObject();
        const undoData = this.undoData;

        if (!activeObj) {
            return Promise.reject(rejectMessages.noActiveObject);
        }

        undoData.object = activeObj;
        undoData.options = {};
        tui.util.forEachOwnProperties(options, (value, key) => {
            undoData.options[key] = activeObj[key];
        });

        return shapeComp.change(activeObj, options);
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const shapeComp = graphics.getComponent(SHAPE);
        const shape = this.undoData.object;
        const options = this.undoData.options;

        return shapeComp.change(shape, options);
    }
};

commandFactory.register(command);

module.exports = command;
