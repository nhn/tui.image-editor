import Panel from './panelMenu';
import { assignmentForDestroy } from '../util';
import templateHtml from './template/submenu/crop';

const historyClassName = 'history-item';
const selectedClassName = 'selected-item';
const disabledClassName = 'disabled-item';

/**
 * History ui class
 * @class
 * @ignore
 */
class History extends Panel {
  constructor(menuElement, { locale, makeSvgIcon, usageStatistics }) {
    super(menuElement, {
      name: 'history',
      locale,
      makeSvgIcon,
      templateHtml,
      usageStatistics,
    });

    this._eventHandler = {};
    this._historyIndex = this.getListLength();
  }

  /**
   * add history
   * @param {string} title - title of history
   */
  addHistory(title) {
    const item = this.makeListItemElement(title);

    this.pushListItemElement(item);
    this._historyIndex = this.getListLength() - 1;
    this._selectItem(this._historyIndex);
  }

  /**
   * Add history menu event
   * @private
   */
  _addHistoryEventListener() {
    this._eventHandler.history = (event) => this._clickHistoryItem(event);
    this.listElement.addEventListener('click', this._eventHandler.history);
  }

  /**
   * Remove history menu event
   * @private
   */
  _removeHistoryEventListener() {
    this.listElement.removeEventListener('click', this._eventHandler.history);
  }

  /**
   * onClick history menu event listener
   * @param {object} event - event object
   * @private
   */
  _clickHistoryItem(event) {
    const { target } = event;
    const item = target.closest(`.${historyClassName}`);

    if (item) {
      const index = Number.parseInt(item.getAttribute('data-index'), 10);

      if (index !== this._historyIndex) {
        this._selectItem(index);
        this._toggleItems(index, this._historyIndex);

        if (index < this._historyIndex) {
          // this._actions.main.undo();
          // 기존 선택되어 있는 인덱스보다 이전일 경우 (index+1 ~ this._historyIndex) 작업들 undo 처리
        } else {
          // 기존 선택되어 있는 인덱스보다 이후일 경우 (this._historyIndex+1 ~ index) 작업들 redo 처리
        }

        this._historyIndex = index;
      }
    }
  }

  /**
   * Change item's state to selected state
   * @param {number} index - index of selected item
   */
  _selectItem(index) {
    for (let i = 0; i < this.getListLength(); i += 1) {
      this.removeClass(i, selectedClassName);
    }
    this.addClass(index, selectedClassName);
  }

  /**
   * Toggle item's state to unselected state
   * @param {number} start - start index to toggle class name
   * @param {number} end - end index to toggle class name
   */
  _toggleItems(start, end) {
    if (start > end) {
      [start, end] = [end, start];
    }

    for (let i = start + 1; i <= end; i += 1) {
      this.toggleClass(i, disabledClassName);
    }
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this.removeEvent();

    assignmentForDestroy(this);
  }

  /**
   * Add event for history
   * @param {Object} actions - actions for crop
   *   @param {Function} actions.undo - undo action
   *   @param {Function} actions.redo - redo action
   */
  addEvent(actions) {
    this._actions = actions;
    this._addHistoryEventListener();
  }

  /**
   * Remove event
   * @private
   */
  removeEvent() {
    this._removeHistoryEventListener();
  }
}

export default History;
