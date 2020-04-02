/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview ShapeDrawingMode class
 */
import DrawingMode from '../interface/drawingMode';
import {drawingModes, componentNames as components} from '../consts';

/**
 * ShapeDrawingMode class
 * @class
 * @ignore
 */
class FiltersectionDrawingMode extends DrawingMode {
    constructor() {
        super(drawingModes.FILTER_SECTION);
    }

    /**
    * start this drawing mode
    * @param {Graphics} graphics - Graphics instance
    * @override
    */
    start(graphics) {
        const filtersection = graphics.getComponent(components.FILTER_SECTION);
        filtersection.start();
    }

    /**
     * stop this drawing mode
     * @param {Graphics} graphics - Graphics instance
     * @override
     */
    end(graphics) {
        const filtersection = graphics.getComponent(components.FILTER_SECTION);
        filtersection.end();
    }
}

export default FiltersectionDrawingMode;
