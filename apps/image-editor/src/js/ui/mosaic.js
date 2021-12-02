import Range from '@/ui/tools/range';
import Submenu from '@/ui/submenuBase';
import templateHtml from '@/ui/template/submenu/mosaic';
import { assignmentForDestroy } from '@/util';
import { defaultMosaicRangeValues } from '@/consts';

/**
 * Draw ui class
 * @class
 * @ignore
 */
class Mosaic extends Submenu {
  constructor(subMenuElement, { locale, makeSvgIcon, menuBarPosition, usageStatistics }) {
    super(subMenuElement, {
      locale,
      name: 'mosaic',
      makeSvgIcon,
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });

    this._els = {
      drawRange: new Range(
        {
          slider: this.selector('.tie-mosaic-range'),
          input: this.selector('.tie-mosaic-range-value'),
        },
        defaultMosaicRangeValues
      ),
    };

    this.width = this._els.drawRange.value;
  }

  /**
   * Executed when the menu starts.
   */
  changeStartMode() {
    this.actions.setDrawMode({
      width: this.width,
      resetImage: this.actions.resetImage,
    });
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();
    this._els.drawRange.destroy();

    assignmentForDestroy(this);
  }

  /**
   * Add event for draw
   * @param {Object} actions - actions for crop
   *   @param {Function} actions.setDrawMode - set draw mode
   */
  addEvent(actions) {
    this.actions = actions;
    this._els.drawRange.on('change', this._changeDrawRange.bind(this));
  }

  /**
   * Remove event
   * @private
   */
  _removeEvent() {
    this._els.drawRange.off();
  }

  /**
   * Change drawing Range
   * @param {number} value - select drawing range
   * @private
   */
  _changeDrawRange(value) {
    this.width = value;
    this.changeStartMode();
  }
}

export default Mosaic;
