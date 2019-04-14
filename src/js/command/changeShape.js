/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview change a shape
 */
import snippet from 'tui-code-snippet';
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
     * @param {number} id - object id
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
    execute(graphics, id, options) {
        const shapeComp = graphics.getComponent(SHAPE);
        const targetObj = graphics.getObject(id);

        if (!targetObj) {
            return Promise.reject(rejectMessages.noObject);
        }

        this.undoData.object = targetObj;
        this.undoData.options = {};
        snippet.forEachOwnProperties(options, (value, key) => {
            this.undoData.options[key] = targetObj[key];
        });

        return shapeComp.change(targetObj, options);
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const shapeComp = graphics.getComponent(SHAPE);
        const {object: shape, options} = this.undoData;

        return shapeComp.change(shape, options);
    }
};

commandFactory.register(command);

module.exports = command;
