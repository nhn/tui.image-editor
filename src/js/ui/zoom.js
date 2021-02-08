import { assignmentForDestroy } from '../util';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/zoom';

const ZOOM_IN = 'zoomIn';
const ZOOM_OUT = 'zoomOut';
const HAND = 'hand';

/**
 * Zoom ui class
 * @class
 * @ignore
 */
class Zoom extends Submenu {
  constructor(subMenuElement, { locale, makeSvgIcon, menuBarPosition, usageStatistics }) {
    super(subMenuElement, {
      locale,
      name: 'zoom',
      makeSvgIcon,
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });

    this._els = {
      zoomButton: this.selector('.tie-zoom-button'),
    };

    this.eventHandler.changeZoom = this._changeZoom.bind(this);
  }

  /**
   * Executed when the menu starts.
   */
  changeStartMode() {
    this._actions.modeChange('zoom');
  }

  /**
   * Returns the menu to its default state.
   */
  changeStandbyMode() {
    this._actions.stopDrawingMode();
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();

    assignmentForDestroy(this);
  }

  /**
   * Add event for zoom
   * @param {Object} actions - actions for zoom
   *   @param {Function} actions.zoom - zoom action
   *   @param {Function} actions.zoomOut - zoomOut action
   *   @param {Function} actions.hand - hand action
   */
  addEvent(actions) {
    this._actions = actions;
    this._els.zoomButton.addEventListener('click', this.eventHandler.changeZoom);
  }

  /**
   * Remove event
   * @private
   */
  _removeEvent() {
    this._els.zoomButton.removeEventListener('click', this.eventHandler.changeZoom);
  }

  /**
   * change Zoom status
   * @param {object} event - change event
   * @private
   */
  _changeZoom(event) {
    const button = event.target.closest('.tui-image-editor-button');

    if (!button) {
      return;
    }

    const zoomType = this.getButtonType(button, [ZOOM_IN, ZOOM_OUT, HAND]);

    this._actions[zoomType]();
  }
}

export default Zoom;
