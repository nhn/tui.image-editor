/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview FreeDrawingMode class
 */
import DrawingMode from '../interface/drawingMode';
import consts from '../consts';

const {drawingModes} = consts;
const components = consts.componentNames;

/**
 * FreeDrawingMode class
 * @class
 * @ignore
 */
class FreeDrawingMode extends DrawingMode {
    constructor() {
        super(drawingModes.FREE_DRAWING);
    }

    /**
    * start this drawing mode
    * @param {Graphics} graphics - Graphics instance
    * @param {{width: ?number, color: ?string}} [options] - Brush width & color
    * @override
    */
    start(graphics, options) {
        const freeDrawing = graphics.getComponent(components.FREE_DRAWING);
        freeDrawing.start(options);
    }

    /**
     * stop this drawing mode
     * @param {Graphics} graphics - Graphics instance
     * @override
     */
    end(graphics) {
        const freeDrawing = graphics.getComponent(components.FREE_DRAWING);
        freeDrawing.end();
    }
}

module.exports = FreeDrawingMode;
