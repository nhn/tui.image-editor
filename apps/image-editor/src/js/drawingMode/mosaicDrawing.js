/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview FreeDrawingMode class
 */
import DrawingMode from '@/interface/drawingMode';
import { drawingModes, componentNames as components } from '@/consts';

/**
 * FreeDrawingMode class
 * @class
 * @ignore
 */
class MosaicDrawingMode extends DrawingMode {
  constructor() {
    super(drawingModes.MOSAIC);
  }

  /**
   * start this drawing mode
   * @param {Graphics} graphics - Graphics instance
   * @param {{width: ?number, color: ?string}} [options] - Brush width & color
   * @override
   */
  start(graphics, options) {
    const MosaicDrawing = graphics.getComponent(components.MOSAIC);
    MosaicDrawing.start(options);
  }

  /**
   * stop this drawing mode
   * @param {Graphics} graphics - Graphics instance
   * @override
   */
  end(graphics) {
    const MosaicDrawing = graphics.getComponent(components.MOSAIC);
    MosaicDrawing.end();
  }
}

export default MosaicDrawingMode;
