/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Free drawing module, Set brush
 */
import Component from '../interface/component';
import consts from '../consts';

/**
 * FreeDrawing
 * @class FreeDrawing
 * @param {Component} parent - parent component
 * @extends {Component}
 * @ignore
 */
class FreeDrawing extends Component {
    constructor(parent) {
        super();
        this.setParent(parent);

        /**
         * Component name
         * @type {string}
         */
        this.name = consts.componentNames.FREE_DRAWING;

        /**
         * Brush width
         * @type {number}
         */
        this.width = 12;

        /**
         * fabric.Color instance for brush color
         * @type {fabric.Color}
         */
        this.oColor = new fabric.Color('rgba(0, 0, 0, 0.5)');
    }

    /**
     * Start free drawing mode
     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
     */
    start(setting) {
        const canvas = this.getCanvas();

        canvas.isDrawingMode = true;
        this.setBrush(setting);
    }

    /**
     * Set brush
     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
     */
    setBrush(setting) {
        const brush = this.getCanvas().freeDrawingBrush;

        setting = setting || {};
        this.width = setting.width || this.width;
        if (setting.color) {
            this.oColor = new fabric.Color(setting.color);
        }
        brush.width = this.width;
        brush.color = this.oColor.toRgba();
    }

    /**
     * End free drawing mode
     */
    end() {
        const canvas = this.getCanvas();

        canvas.isDrawingMode = false;
    }
}

module.exports = FreeDrawing;
