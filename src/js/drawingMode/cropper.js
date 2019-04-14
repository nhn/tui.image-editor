/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview CropperDrawingMode class
 */
import DrawingMode from '../interface/drawingMode';
import consts from '../consts';

const {drawingModes} = consts;
const components = consts.componentNames;

/**
 * CropperDrawingMode class
 * @class
 * @ignore
 */
class CropperDrawingMode extends DrawingMode {
    constructor() {
        super(drawingModes.CROPPER);
    }

    /**
    * start this drawing mode
    * @param {Graphics} graphics - Graphics instance
    * @override
    */
    start(graphics) {
        const cropper = graphics.getComponent(components.CROPPER);
        cropper.start();
    }

    /**
     * stop this drawing mode
     * @param {Graphics} graphics - Graphics instance
     * @override
     */
    end(graphics) {
        const cropper = graphics.getComponent(components.CROPPER);
        cropper.end();
    }
}

module.exports = CropperDrawingMode;
