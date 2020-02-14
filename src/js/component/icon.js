/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Add icon module
 */
import fabric from 'fabric';
import snippet from 'tui-code-snippet';
import Promise from 'core-js/library/es6/promise';
import Component from '../interface/component';
import consts from '../consts';

const events = consts.eventNames;
const {rejectMessages} = consts;

const pathMap = {
    arrow: 'M 0 90 H 105 V 120 L 160 60 L 105 0 V 30 H 0 Z',
    cancel: 'M 0 30 L 30 60 L 0 90 L 30 120 L 60 90 L 90 120 L 120 90 ' +
            'L 90 60 L 120 30 L 90 0 L 60 30 L 30 0 Z'
};

/**
 * Icon
 * @class Icon
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
class Icon extends Component {
    constructor(graphics) {
        super(consts.componentNames.ICON, graphics);

        /**
         * Default icon color
         * @type {string}
         */
        this._oColor = '#000000';

        /**
         * Path value of each icon type
         * @type {Object}
         */
        this._pathMap = pathMap;

        /**
         * Option to add icon to drag.
         * @type {boolean}
         */
        this.useDragAddIcon = graphics.useDragAddIcon;
    }

    /**
     * Add icon
     * @param {string} type - Icon type
     * @param {Object} options - Icon options
     *      @param {string} [options.fill] - Icon foreground color
     *      @param {string} [options.left] - Icon x position
     *      @param {string} [options.top] - Icon y position
     * @returns {Promise}
     */
    add(type, options) {
        return new Promise((resolve, reject) => {
            const canvas = this.getCanvas();
            const path = this._pathMap[type];
            const selectionStyle = consts.fObjectOptions.SELECTION_STYLE;
            const registerdIcon = Object.keys(consts.defaultIconPath).indexOf(type) >= 0;
            const useDragAddIcon = this.useDragAddIcon && registerdIcon;
            const icon = path ? this._createIcon(path) : null;

            if (!icon) {
                reject(rejectMessages.invalidParameters);
            }

            icon.set(snippet.extend({
                type: 'icon',
                fill: this._oColor
            }, selectionStyle, options, this.graphics.controlStyle));

            canvas.add(icon).setActiveObject(icon);

            if (useDragAddIcon) {
                this._addWithDragEvent(canvas);
            }

            resolve(this.graphics.createObjectProperties(icon));
        });
    }

    /**
     * Added icon drag event
     * @param {fabric.Canvas} canvas - Canvas instance
     * @private
     */
    _addWithDragEvent(canvas) {
        canvas.on({
            'mouse:move': fEvent => {
                canvas.selection = false;

                this.fire(events.ICON_CREATE_RESIZE, {
                    moveOriginPointer: canvas.getPointer(fEvent.e)
                });
            },
            'mouse:up': fEvent => {
                this.fire(events.ICON_CREATE_END, {
                    moveOriginPointer: canvas.getPointer(fEvent.e)
                });

                canvas.defaultCursor = 'default';
                canvas.off('mouse:up');
                canvas.off('mouse:move');
                canvas.selection = true;
            }
        });
    }

    /**
     * Register icon paths
     * @param {{key: string, value: string}} pathInfos - Path infos
     */
    registerPaths(pathInfos) {
        snippet.forEach(pathInfos, (path, type) => {
            this._pathMap[type] = path;
        }, this);
    }

    /**
     * Set icon object color
     * @param {string} color - Color to set
     * @param {fabric.Path}[obj] - Current activated path object
     */
    setColor(color, obj) {
        this._oColor = color;

        if (obj && obj.get('type') === 'icon') {
            obj.set({fill: this._oColor});
            this.getCanvas().renderAll();
        }
    }

    /**
     * Get icon color
     * @param {fabric.Path}[obj] - Current activated path object
     * @returns {string} color
     */
    getColor(obj) {
        return obj.fill;
    }

    /**
     * Create icon object
     * @param {string} path - Path value to create icon
     * @returns {fabric.Path} Path object
     */
    _createIcon(path) {
        return new fabric.Path(path);
    }
}

module.exports = Icon;
