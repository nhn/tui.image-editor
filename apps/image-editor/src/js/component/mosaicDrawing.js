/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Free drawing module, Set brush
 */
import { fabric } from 'fabric';
import Component from '@/interface/component';
import { componentNames } from '@/consts';

/**
 * FreeDrawing
 * @class FreeDrawing
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
class MosaicDrawing extends Component {
  constructor(graphics) {
    super(componentNames.MOSAIC, graphics);

    /**
     * Brush width
     * @type {number}
     */
    this.width = 12;

    this._listeners = {
      mousedown: this._onFabricMouseDown.bind(this),
      mousemove: this._onFabricMouseMove.bind(this),
      mouseup: this._onFabricMouseUp.bind(this),
    };
  }

  /**
   * Start free drawing mode
   */
  start({ width, resetImage }) {
    const canvas = this.getCanvas();
    canvas.discardActiveObject();
    canvas.selection = false;
    canvas.defaultCursor = 'crosshair';
    this.width = width;
    this.resetImage = resetImage;
    canvas.on('mouse:down', this._listeners.mousedown);
  }

  /**
   * End free drawing mode
   */
  end() {
    const canvas = this.getCanvas();

    canvas.off('mouse:down', this._listeners.mousedown);
  }

  /**
   * Get source image on canvas
   * @returns {fabric.Image} Current source image on canvas
   * @private
   */
  _getSourceImage() {
    return this.getCanvasImage();
  }

  _onFabricMouseDown(fEvent) {
    const canvas = this.getCanvas();
    canvas.selection = false;

    if (fEvent.target) {
      return;
    }

    canvas.selection = false;
    const coord = canvas.getPointer(fEvent.e);

    this._startX = coord.x;
    this._startY = coord.y;

    canvas.on({
      'mouse:move': this._listeners.mousemove,
      'mouse:up': this._listeners.mouseup,
    });
  }

  getXY(obj, x, y) {
    const w = obj.width;
    const color = [];
    color[0] = obj.data[4 * (y * w + x)];
    color[1] = obj.data[4 * (y * w + x) + 1];
    color[2] = obj.data[4 * (y * w + x) + 2];
    color[3] = obj.data[4 * (y * w + x) + 3];

    return color;
  }

  setXY(obj, x, y, color) {
    const w = obj.width;
    obj.data[4 * (y * w + x)] = color[0];
    obj.data[4 * (y * w + x) + 1] = color[1];
    obj.data[4 * (y * w + x) + 2] = color[2];
    obj.data[4 * (y * w + x) + 3] = color[3];
  }

  _onFabricMouseMove(fEvent) {
    const canvas = this.getCanvas();
    const { width, height } = this._getSourceImage();
    const image = canvas.getContext().getImageData(0, 0, width, height);
    const pointer = canvas.getPointer(fEvent.e);
    const x = Math.ceil(pointer.x);
    const y = Math.ceil(pointer.y);
    const isOut = (_x, _y) => _x > width || _x < 0 || _y > height || _y < 0;
    if (isOut(x, y)) {
      return;
    }

    const color = this.getXY(image, x, y);

    // eslint-disable-next-line no-plusplus
    for (let k = 0; k < this.width; k++) {
      // eslint-disable-next-line no-plusplus
      for (let l = 0; l < this.width; l++) {
        if (!isOut(x + l, y + k)) this.setXY(image, x + l, y + k, color);
      }
    }

    const ctx = canvas.getContext();
    ctx.putImageData(image, 0, 0);
  }

  _onFabricMouseUp() {
    const listeners = this._listeners;
    const canvas = this.getCanvas();

    this.resetImage(canvas.getElement().toDataURL());

    canvas.off({
      'mouse:move': listeners.mousemove,
      'mouse:up': listeners.mouseup,
    });
  }
}

export default MosaicDrawing;
