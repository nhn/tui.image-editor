/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Image zoom module (start zoom, end zoom)
 */
import fabric from 'fabric';
import Component from '../interface/component';
import { componentNames, eventNames } from '../consts';
import { clamp } from '../util';

const MOUSE_MOVE_THRESHOLD = 10;
const DEFAULT_SCROLL_OPTION = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  stroke: 'grey',
  strokeWidth: 0,
  fill: '#DCDADA',
  evented: false,
  selectable: false,
  hoverCursor: 'auto',
};
const DEFAULT_SCROLL_SIZE_RATIO = 0.01;

/**
 * Zoom components
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @class Zoom
 * @ignore
 */
class Zoom extends Component {
  constructor(graphics) {
    super(componentNames.ZOOM, graphics);

    /**
     * zoomArea
     * @type {?fabric.Rect}
     * @private
     */
    this.zoomArea = null;

    /**
     * Start point of zoom area
     * @type {?{x: number, y: number}}
     */
    this._startPoint = null;

    /**
     * Center point of every zoom
     * @type {Array.<{prevZoomLevel: number, zoomLevel: number, x: number, y: number}>}
     */
    this._centerPoints = [];

    /**
     * Zoom level (default: 100%(1.0), max: 400%(4.0)
     * @type {number}
     */
    this.zoomLevel = 1.0;

    /**
     * Listeners
     * @type {Object.<string, Function>}
     * @private
     */
    this._listeners = {
      startZoom: this._startZoomArea.bind(this),
      moveZoom: this._moveZoomArea.bind(this),
      stopZoom: this._endZoomArea.bind(this),
      startHand: this._startHand.bind(this),
      moveHand: this._moveHand.bind(this),
      stopHand: this._endHand.bind(this),
      changeZoom: this._changeZoom.bind(this),
    };

    const canvas = this.getCanvas();

    /**
     * Width:Height ratio (ex. width=1.5, height=1 -> aspectRatio=1.5)
     * @private
     */
    this.aspectRatio = canvas.width / canvas.height;

    /**
     * vertical scroll bar
     * @type {fabric.Rect}
     * @private
     */
    this._verticalScroll = new fabric.Rect(DEFAULT_SCROLL_OPTION);

    /**
     * horizontal scroll bar
     * @type {fabric.Rect}
     * @private
     */
    this._horizontalScroll = new fabric.Rect(DEFAULT_SCROLL_OPTION);

    canvas.on(eventNames.CHANGE_ZOOM, this._listeners.changeZoom);
  }

  /**
   * Start zoom-in mode
   */
  startZoomInMode() {
    if (this.zoomArea) {
      return;
    }
    const canvas = this.getCanvas();

    canvas.forEachObject((obj) => {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = false;
    });

    this.zoomArea = new fabric.Rect({
      left: 0,
      top: 0,
      width: 0.5,
      height: 0.5,
      stroke: 'black',
      strokeWidth: 1,
      fill: 'transparent',
      hoverCursor: 'zoom-in',
    });

    canvas.discardActiveObject();
    canvas.add(this.zoomArea);
    canvas.on('mouse:down', this._listeners.startZoom);
    canvas.selection = false;
    canvas.defaultCursor = 'zoom-in';
  }

  /**
   * End zoom-in mode
   */
  endZoomInMode() {
    const canvas = this.getCanvas();
    const { startZoom, moveZoom, stopZoom } = this._listeners;

    canvas.selection = true;
    canvas.defaultCursor = 'default';
    canvas.off({
      'mouse:down': startZoom,
      'mouse:move': moveZoom,
      'mouse:up': stopZoom,
    });
    canvas.forEachObject((obj) => {
      obj.evented = true;
    });

    this.zoomArea = null;
  }

  /**
   * Start zoom drawing mode
   */
  start() {
    this.zoomArea = null;
    this._startPoint = null;
    this._startHandPoint = null;
  }

  /**
   * Stop zoom drawing mode
   */
  end() {
    this.endZoomInMode();
    this.endHandMode();
  }

  /**
   * Start hand mode
   */
  startHandMode() {
    const canvas = this.getCanvas();

    canvas.forEachObject((obj) => {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = false;
    });

    canvas.discardActiveObject();
    canvas.on('mouse:down', this._listeners.startHand);
    canvas.selection = false;
    canvas.defaultCursor = 'grab';
  }

  /**
   * Stop hand mode
   */
  endHandMode() {
    const canvas = this.getCanvas();

    canvas.forEachObject((obj) => {
      // {@link http://fabricjs.com/docs/fabric.Object.html#evented}
      obj.evented = true;
    });

    canvas.off('mouse:down', this._listeners.startHand);
    canvas.selection = true;
    canvas.defaultCursor = 'auto';

    this._startHandPoint = null;
  }

  /**
   * onMousedown handler in fabric canvas
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _startZoomArea(fEvent) {
    const canvas = this.getCanvas();

    if (fEvent.target) {
      return;
    }

    canvas.selection = false;

    this._startPoint = canvas.getPointer(fEvent.e);

    const { moveZoom, stopZoom } = this._listeners;
    canvas.on({
      'mouse:move': moveZoom,
      'mouse:up': stopZoom,
    });
  }

  /**
   * onMousemove handler in fabric canvas
   * @param {{event: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _moveZoomArea({ event }) {
    const canvas = this.getCanvas();
    const pointer = canvas.getPointer(event);
    const { x, y } = pointer;
    const { zoomArea, _startPoint } = this;
    const deltaX = Math.abs(x - _startPoint.x);
    const deltaY = Math.abs(y - _startPoint.y);

    if (deltaX + deltaY > MOUSE_MOVE_THRESHOLD) {
      canvas.remove(zoomArea);
      zoomArea.set(this._calcRectDimensionFromPoint(x, y));
      canvas.add(zoomArea);
    }
  }

  /**
   * Get rect dimension setting from Canvas-Mouse-Position(x, y)
   * @param {number} x - Canvas-Mouse-Position x
   * @param {number} y - Canvas-Mouse-Position Y
   * @returns {{left: number, top: number, width: number, height: number}}
   * @private
   */
  _calcRectDimensionFromPoint(x, y) {
    const canvas = this.getCanvas();
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const { x: startX, y: startY } = this._startPoint;
    const { min } = Math;

    const left = min(startX, x);
    const top = min(startY, y);
    const width = clamp(x, startX, canvasWidth) - left; // (startX <= x(mouse) <= canvasWidth) - left
    const height = clamp(y, startY, canvasHeight) - top; // (startY <= y(mouse) <= canvasHeight) - top

    return { left, top, width, height };
  }

  /**
   * onMouseup handler in fabric canvas
   * @private
   */
  _endZoomArea() {
    const { zoomArea } = this;
    const { moveZoom, stopZoom } = this._listeners;
    const canvas = this.getCanvas();
    const center = this._getCenterPoint();
    const { x, y } = center;

    if (!this._isMaxZoomLevel()) {
      this._centerPoints.push({
        x,
        y,
        prevZoomLevel: this.zoomLevel,
        zoomLevel: this.zoomLevel + 1,
      });
      this.zoomLevel += 1;
      canvas.zoomToPoint({ x, y }, this.zoomLevel);

      canvas.fire(eventNames.CHANGE_ZOOM, {
        viewport: canvas.calcViewportBoundaries(),
        zoomLevel: this.zoomLevel,
      });
    }

    canvas.remove(zoomArea);
    canvas.off({
      'mouse:move': moveZoom,
      'mouse:up': stopZoom,
    });

    this._startPoint = null;
  }

  /**
   * Get center point
   * @returns {{x: number, y: number}}
   * @private
   */
  _getCenterPoint() {
    const { left, top, width, height } = this.zoomArea;
    const { aspectRatio } = this;

    return width > height
      ? { x: left + (aspectRatio * height) / 2, y: top + height / 2 }
      : { x: left + width / 2, y: top + width / aspectRatio / 2 };
  }

  /**
   * Zoom the canvas
   * @param {{x: number, y: number}} center - center of zoom
   * @param {?number} zoomLevel - zoom level
   */
  zoom({ x, y }, zoomLevel = this.zoomLevel) {
    const canvas = this.getCanvas();
    const centerPoints = this._centerPoints;

    let point;
    // eslint-disable-next-line no-cond-assign
    while ((point = centerPoints.pop())) {
      if (point.zoomLevel < zoomLevel) {
        centerPoints.push(point);
        break;
      }

      const { x: prevX, y: prevY, prevZoomLevel } = point;

      canvas.zoomToPoint({ x: prevX, y: prevY }, prevZoomLevel);
      this.zoomLevel = prevZoomLevel;
    }

    canvas.zoomToPoint({ x, y }, zoomLevel);
    if (zoomLevel !== 1.0) {
      this._centerPoints.push({
        x,
        y,
        zoomLevel,
        prevZoomLevel: this.zoomLevel,
      });
    }
    this.zoomLevel = zoomLevel;

    canvas.fire(eventNames.CHANGE_ZOOM, { viewport: canvas.calcViewportBoundaries(), zoomLevel });
  }

  /**
   * Zoom out one step
   */
  zoomOut() {
    const centerPoints = this._centerPoints;

    if (!centerPoints.length) {
      return;
    }

    const canvas = this.getCanvas();
    const point = centerPoints.pop();
    const { x, y, prevZoomLevel } = point;

    if (prevZoomLevel === 1.0) {
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    } else {
      canvas.zoomToPoint({ x, y }, prevZoomLevel);
    }

    this.zoomLevel = prevZoomLevel;

    canvas.fire(eventNames.CHANGE_ZOOM, {
      viewport: canvas.calcViewportBoundaries(),
      zoomLevel: this.zoomLevel,
    });
  }

  /**
   * Zoom reset
   */
  resetZoom() {
    const canvas = this.getCanvas();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

    this.zoomLevel = 1.0;
    this._centerPoints = [];

    canvas.fire(eventNames.CHANGE_ZOOM, {
      viewport: canvas.calcViewportBoundaries(),
      zoomLevel: this.zoomLevel,
    });
  }

  /**
   * Whether zoom level is max (5.0)
   * @returns {boolean}
   * @private
   */
  _isMaxZoomLevel() {
    return this.zoomLevel >= 5.0;
  }

  /**
   * Move point of zoom
   * @param {{x: number, y: number}} delta - move amount
   * @private
   */
  _movePointOfZoom({ x: deltaX, y: deltaY }) {
    const centerPoints = this._centerPoints;

    if (!centerPoints.length) {
      return;
    }

    const canvas = this.getCanvas();
    centerPoints.pop();

    const point = this._originalLastZoomPoint;
    const { x: originX, y: originY, prevZoomLevel } = point;
    const x = originX - deltaX;
    const y = originY - deltaY;

    canvas.zoomToPoint({ x: originX, y: originY }, prevZoomLevel);
    canvas.zoomToPoint({ x, y }, this.zoomLevel);
    this._centerPoints.push({ x, y, prevZoomLevel, zoomLevel: this.zoomLevel });

    canvas.fire(eventNames.CHANGE_ZOOM, {
      viewport: canvas.calcViewportBoundaries(),
      zoomLevel: this.zoomLevel,
    });
  }

  /**
   * onMouseDown handler in fabric canvas
   * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _startHand(fEvent) {
    const canvas = this.getCanvas();

    if (fEvent.target) {
      return;
    }

    if (this.zoomLevel === 1.0) {
      return;
    }

    canvas.selection = false;

    const point = this._centerPoints.pop();
    this._originalLastZoomPoint = point;
    this._centerPoints.push(point);
    this._startHandPoint = canvas.getPointer(fEvent.e);

    const { moveHand, stopHand } = this._listeners;
    canvas.on({
      'mouse:move': moveHand,
      'mouse:up': stopHand,
    });
  }

  /**
   * onMouseMove handler in fabric canvas
   * @param {{event: MouseEvent}} fEvent - Fabric event
   * @private
   */
  _moveHand({ event }) {
    const canvas = this.getCanvas();
    const { x, y } = canvas.getPointer(event);
    const deltaX = x - this._startHandPoint.x;
    const deltaY = y - this._startHandPoint.y;

    this._movePointOfZoom({ x: deltaX, y: deltaY });
  }

  /**
   * onMouseUp handler in fabric canvas
   * @private
   */
  _endHand() {
    const canvas = this.getCanvas();
    const { moveHand, stopHand } = this._listeners;

    canvas.off({
      'mouse:move': moveHand,
      'mouse:up': stopHand,
    });

    this._startHandPoint = null;
  }

  /**
   * onChangeZoom handler in fabric canvas
   * @private
   */
  _changeZoom({ viewport, zoomLevel }) {
    const canvas = this.getCanvas();

    canvas.remove(this._verticalScroll);
    canvas.remove(this._horizontalScroll);

    if (zoomLevel === 1.0) {
      return;
    }

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const { tl, tr, bl } = viewport;
    const viewportWidth = tr.x - tl.x;
    const viewportHeight = bl.y - tl.y;

    const horizontalScrollWidth = (viewportWidth * viewportWidth) / canvasWidth;
    const horizontalScrollHeight = viewportHeight * DEFAULT_SCROLL_SIZE_RATIO;
    const horizontalScrollLeft = clamp(
      tl.x + (tl.x / canvasWidth) * viewportWidth,
      tl.x,
      tr.x - horizontalScrollWidth
    );

    this._horizontalScroll.set({
      left: horizontalScrollLeft,
      top: bl.y - horizontalScrollHeight,
      width: horizontalScrollWidth,
      height: horizontalScrollHeight,
    });

    const verticalScrollWidth = viewportWidth * DEFAULT_SCROLL_SIZE_RATIO;
    const verticalScrollHeight = (viewportHeight * viewportHeight) / canvasHeight;
    const verticalScrollTop = clamp(
      tl.y + (tl.y / canvasHeight) * viewportHeight,
      tr.y,
      bl.y - verticalScrollHeight
    );

    this._verticalScroll.set({
      left: tr.x - verticalScrollWidth,
      top: verticalScrollTop,
      width: verticalScrollWidth,
      height: verticalScrollHeight,
    });

    canvas.add(this._horizontalScroll);
    canvas.add(this._verticalScroll);
  }
}

export default Zoom;
