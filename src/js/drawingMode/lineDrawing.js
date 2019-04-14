/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview LineDrawingMode class
 */
import DrawingMode from '../interface/drawingMode';
import consts from '../consts';

const {drawingModes} = consts;
const components = consts.componentNames;

/**
 * LineDrawingMode class
 * @class
 * @ignore
 */
class LineDrawingMode extends DrawingMode {
    constructor() {
        super(drawingModes.LINE_DRAWING);
    }

    /**
    * start this drawing mode
    * @param {Graphics} graphics - Graphics instance
    * @param {{width: ?number, color: ?string}} [options] - Brush width & color
    * @override
    */
    start(graphics, options) {
        const lineDrawing = graphics.getComponent(components.LINE);
        lineDrawing.start(options);
    }

    /**
     * stop this drawing mode
     * @param {Graphics} graphics - Graphics instance
     * @override
     */
    end(graphics) {
        const lineDrawing = graphics.getComponent(components.LINE);
        lineDrawing.end();
    }
}

module.exports = LineDrawingMode;
