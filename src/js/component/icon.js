/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add icon module
 */
import Component from '../interface/component';
import consts from '../consts';

const pathMap = {
    arrow: 'M 0 90 H 105 V 120 L 160 60 L 105 0 V 30 H 0 Z',
    cancel: 'M 0 30 L 30 60 L 0 90 L 30 120 L 60 90 L 90 120 L 120 90 ' +
            'L 90 60 L 120 30 L 90 0 L 60 30 L 30 0 Z'
};

/**
 * Icon
 * @class Icon
 * @param {Component} parent - parent component
 * @extends {Component}
 * @ignore
 */
class Icon extends Component {
    constructor(parent) {
        super();
        this.setParent(parent);

        /**
         * Component name
         * @type {string}
         */
        this.name = consts.componentNames.ICON;

        /**
         * Default icon color
         * @type {string}
         */
        this._oColor = '#000000';

        /**
         * Path value of each icon type
         * @type {object}
         */
        this._pathMap = pathMap;
    }

    /**
     * Add icon
     * @param {string} type - Icon type
     * @param {object} options - Icon options
     *      @param {string} [options.fill] - Icon foreground color
     *      @param {string} [options.left] - Icon x position
     *      @param {string} [options.top] - Icon y position
     */
    add(type, options) {
        const canvas = this.getCanvas();
        const path = this._pathMap[type];
        const selectionStyle = consts.fObjectOptions.SELECTION_STYLE;

        if (!path) {
            return;
        }

        const icon = this._createIcon(path);

        icon.set(tui.util.extend({
            type: 'icon',
            fill: this._oColor
        }, selectionStyle, options));

        canvas.add(icon).setActiveObject(icon);
    }

    /**
     * Register icon paths
     * @param {{key: string, value: string}} pathInfos - Path infos
     */
    registerPaths(pathInfos) {
        tui.util.forEach(pathInfos, (path, type) => {
            this._pathMap[type] = path;
        }, this);
    }

    /**
     * Set icon object color
     * @param {strign} color - Color to set
     * @param {fabric.Path}[obj] - Current activated path object
     */
    setColor(color, obj) {
        this._oColor = color;

        if (obj && obj.get('type') === 'icon') {
            obj.setFill(this._oColor);
            this.getCanvas().renderAll();
        }
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
