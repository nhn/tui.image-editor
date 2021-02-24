/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview ZoomDrawingMode class
 */
import DrawingMode from '../interface/drawingMode';
import { drawingModes, componentNames as components } from '../consts';

/**
 * ZoomDrawingMode class
 * @class
 * @ignore
 */
class ZoomDrawingMode extends DrawingMode {
  constructor() {
    super(drawingModes.ZOOM);
  }

  /**
   * start this drawing mode
   * @param {Graphics} graphics - Graphics instance
   * @param {Object} option - drawing mode option
   * @override
   */
  start(graphics, option) {
    const zoom = graphics.getComponent(components.ZOOM);

    zoom.start(option);
  }

  /**
   * stop this drawing mode
   * @param {Graphics} graphics - Graphics instance
   * @override
   */
  end(graphics) {
    const zoom = graphics.getComponent(components.ZOOM);

    zoom.end();
  }
}

export default ZoomDrawingMode;
