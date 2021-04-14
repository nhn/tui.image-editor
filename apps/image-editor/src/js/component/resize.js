import Component from '@/interface/component';
import { componentNames } from '@/consts';

/**
 * Resize components
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @class Resize
 * @ignore
 */
class Resize extends Component {
  constructor(graphics) {
    super(componentNames.RESIZE, graphics);

    /**
     * Current dimensions
     * @type {Object}
     * @private
     */
    this._dimensions = null;

    /**
     * Original dimensions
     * @type {Object}
     * @private
     */
    this._originalDimensions = null;

    /**
     * Lock aspect ratio state
     * @type {boolean}
     * @private
     */
    this._lockState = false;
  }

  /**
   * Get current dimensions
   * @returns {object}
   */
  getCurrentDimensions() {
    if (!this._dimensions) {
      const canvasImage = this.getCanvasImage();
      this._dimensions = {
        width: canvasImage.width,
        height: canvasImage.height,
      };
    }

    return this._dimensions;
  }

  /**
   * Get original dimensions
   * @returns {object}
   */
  getOriginalDimensions() {
    return this._originalDimensions;
  }

  /**
   * Set original dimensions
   * @param {object} dimensions - Dimensions
   */
  setOriginalDimensions(dimensions) {
    this._originalDimensions = dimensions;
  }

  /**
   * Set states of lock aspect ratio
   * @param {boolean} lockState - Lock aspect ratio state
   */
  setLockState(lockState) {
    this._lockState = lockState;
  }

  /**
   * Resize Image
   * @param {Object} dimensions - Resize dimensions
   * @returns {Promise}
   * @private
   */
  resize(dimensions) {
    const canvasImage = this.getCanvasImage();
    const scaleValues = {
      scaleX: dimensions.width ? dimensions.width / canvasImage.width : canvasImage.scaleX,
      scaleY: dimensions.height ? dimensions.height / canvasImage.height : canvasImage.scaleY,
    };

    if (canvasImage.scaleX !== scaleValues.scaleX || canvasImage.scaleY !== scaleValues.scaleY) {
      canvasImage.set(scaleValues).setCoords();

      this._dimensions = {
        width: canvasImage.width * canvasImage.scaleX,
        height: canvasImage.height * canvasImage.scaleY,
      };
    }

    this.adjustCanvasDimensionBase();

    return Promise.resolve();
  }

  /**
   * Start resizing
   */
  start() {
    const dimensions = this.getCurrentDimensions();
    this.setOriginalDimensions(dimensions);
  }

  /**
   * End resizing
   */
  end() {}
}

export default Resize;
