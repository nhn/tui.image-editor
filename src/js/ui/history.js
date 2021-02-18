import Panel from './panelMenu';
import { assignmentForDestroy } from '../util';

const historyClassName = 'history-item';
const selectedClassName = 'selected-item';
const disabledClassName = 'disabled-item';

/**
 * History ui class
 * @class
 * @ignore
 */
class History extends Panel {
  constructor(menuElement) {
    super(menuElement, { name: 'history' });
    menuElement.classList.add('enabled');

    this._eventHandler = {};
    this._historyIndex = this.getListLength();
  }

  /**
   * Add history
   * @param {string} name - name of history
   * @param {?string} detail - detail information of history
   */
  add({ name, detail }) {
    if (this._hasDisabledItem()) {
      this.deleteListItemElement(this._historyIndex + 1, this.getListLength());
    }

    const item = this.makeListItemElement(`${name} (${detail})`);

    this.pushListItemElement(item);
    this._historyIndex = this.getListLength() - 1;
    this._selectItem(this._historyIndex);
  }

  /**
   * Init history
   */
  init() {
    this.deleteListItemElement(1, this.getListLength());
    this._historyIndex = 0;
    this._selectItem(this._historyIndex);
  }

  /**
   * Clear history
   */
  clear() {
    this.deleteListItemElement(0, this.getListLength());
    this._historyIndex = -1;
  }

  /**
   * Select previous history of current selected history
   */
  prev() {
    this._historyIndex -= 1;
    this._selectItem(this._historyIndex);
  }

  /**
   * Select next history of current selected history
   */
  next() {
    this._historyIndex += 1;
    this._selectItem(this._historyIndex);
  }

  /**
   * Whether history menu has disabled item
   * @returns {boolean}
   */
  _hasDisabledItem() {
    return this.getListLength() - 1 > this._historyIndex;
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

    if (!item) {
      return;
    }

    const index = Number.parseInt(item.getAttribute('data-index'), 10);

    if (index !== this._historyIndex) {
      const count = Math.abs(index - this._historyIndex);

      if (index < this._historyIndex) {
        this._actions.undo(count);
      } else {
        this._actions.redo(count);
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
      this.removeClass(i, disabledClassName);
      if (i > index) {
        this.addClass(i, disabledClassName);
      }
    }
    this.addClass(index, selectedClassName);
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
