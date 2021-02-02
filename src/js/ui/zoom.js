import snippet from 'tui-code-snippet';
import { assignmentForDestroy } from '../util';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/zoom';

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
    // this.flipStatus = false;

    this._els = {
      zoomButton: this.selector('.tie-zoom-button'),
    };
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
    this.eventHandler.changeZoom = this._changeZoom.bind(this);
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

    const zoomType = this.getButtonType(button, ['zoomIn', 'zoomOut', 'hand']);

    if (zoomType === 'zoomIn') {
      this._actions.zoom();
    } else if (zoomType === 'zoomOut') {
      this._actions.zoomOut();
    } else {
      this._actions.hand();
    }

    //   if (!this.flipStatus && flipType === 'resetFlip') {
    //     return;
    //   }
    //
    //   this._actions.flip(flipType).then((flipStatus) => {
    //     const flipClassList = this._els.flipButton.classList;
    //     this.flipStatus = false;
    //
    //     flipClassList.remove('resetFlip');
    //     snippet.forEach(['flipX', 'flipY'], (type) => {
    //       flipClassList.remove(type);
    //       if (flipStatus[type]) {
    //         flipClassList.add(type);
    //         flipClassList.add('resetFlip');
    //         this.flipStatus = true;
    //       }
    //     });
    //   });
  }
}

export default Zoom;
