/**
 * @author NHN. FE Development Lab <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/ui/history.js"
 */

import History from '../src/js/ui/history';

describe('history', () => {
  let history;
  let options;

  beforeEach(() => {
    options = {};
    history = new History(document.createElement('div'), options);
    history._actions = { undo() {}, redo() {} };
  });

  it('should add a history item', () => {
    spyOn(history, '_selectItem');

    history.add('title');

    expect(history.getListLength()).toBe(1);
    expect(history._selectItem).toHaveBeenCalled();
  });

  it('should add an event listener', () => {
    spyOn(history.listElement, 'addEventListener');

    history._addHistoryEventListener();

    expect(history.listElement.addEventListener).toHaveBeenCalled();
  });

  it('should remove an event listener', () => {
    spyOn(history.listElement, 'removeEventListener');

    history._removeHistoryEventListener();

    expect(history.listElement.removeEventListener).toHaveBeenCalled();
  });

  describe('_clickHistoryItem', () => {
    let target;

    beforeEach(() => {
      target = document.createElement('li');
      target.className = 'history-item';
      target.setAttribute('data-index', 1);

      history.add('index0');
      history.add('index1');
    });

    it('should nothing when index is the same as historyIndex', () => {
      spyOn(history, '_selectItem');

      history._clickHistoryItem({ target });

      expect(history._selectItem).not.toHaveBeenCalled();
    });

    it('should undo action when is index less than historyIndex', () => {
      spyOn(history._actions, 'undo');
      history.add('index2');
      history._clickHistoryItem({ target });

      expect(history._actions.undo).toHaveBeenCalledTimes(1);
    });

    it('should redo action when is index greater than historyIndex', () => {
      spyOn(history._actions, 'redo');
      history.add('index2');
      history._historyIndex = 1;

      target.setAttribute('data-index', 2);
      history._clickHistoryItem({ target });

      expect(history._actions.redo).toHaveBeenCalledTimes(1);
    });
  });

  describe('_selectItem', () => {
    let index;
    let listLength;

    beforeEach(() => {
      history.add('index0');
      history.add('index1');
      index = 1;
      listLength = history.getListLength();
    });

    it('should select item', () => {
      spyOn(history, 'addClass');
      spyOn(history, 'removeClass');

      history._selectItem(index);

      expect(history.addClass).toHaveBeenCalledTimes(1);
      expect(history.addClass).toHaveBeenCalledWith(index, 'selected-item');
      expect(history.removeClass).toHaveBeenCalledTimes(listLength * 2);
    });
  });

  it('should destroy history instance', () => {
    history.destroy();

    for (const prop in history) {
      if (history.hasOwnProperty(prop)) {
        expect(history[prop]).toBe(null);
      }
    }
  });

  it('should register an action and add event listener', () => {
    const actions = {};
    spyOn(history, '_addHistoryEventListener');

    history.addEvent(actions);

    expect(history._addHistoryEventListener).toHaveBeenCalled();
    expect(history._actions).toEqual(actions);
  });

  it('should register an action and add event listener', () => {
    spyOn(history, '_removeHistoryEventListener');

    history.removeEvent();

    expect(history._removeHistoryEventListener).toHaveBeenCalled();
  });
});
