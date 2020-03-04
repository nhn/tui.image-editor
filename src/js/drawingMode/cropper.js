/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview CropperDrawingMode class
 */
import DrawingMode from '../interface/drawingMode';
import {drawingModes, componentNames as components} from '../consts';

/**
 * CropperDrawingMode class
 * @class
 * @ignore
 */
export default class CropperDrawingMode extends DrawingMode {
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
