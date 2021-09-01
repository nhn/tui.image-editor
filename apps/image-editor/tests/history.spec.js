import History from '@/ui/history';

describe('history', () => {
  let history, options, name, detail;

  beforeEach(() => {
    options = {};
    history = new History(document.createElement('div'), options);
    history._actions = { undo() {}, redo() {} };
    history.makeSvgIcon = () => {};
    history.locale = { localize: (historyName) => historyName };

    name = 'history-name';
    detail = 'history-detail';
  });

  it('should add a history item', () => {
    jest.spyOn(history, '_selectItem');

    history.add({ name, detail });

    expect(history.getListLength()).toBe(1);
    expect(history._selectItem).toHaveBeenCalled();
  });

  it('should add an event listener', () => {
    jest.spyOn(history.listElement, 'addEventListener');

    history._addHistoryEventListener();

    expect(history.listElement.addEventListener).toHaveBeenCalled();
  });

  it('should remove an event listener', () => {
    jest.spyOn(history.listElement, 'removeEventListener');

    history._removeHistoryEventListener();

    expect(history.listElement.removeEventListener).toHaveBeenCalled();
  });

  describe('_clickHistoryItem', () => {
    let target;

    beforeEach(() => {
      name = 'history-name';
      detail = 'history-detail';

      target = document.createElement('li');
      target.className = 'history-item';
      target.setAttribute('data-index', 1);

      history.add({ name, detail });
      history.add({ name, detail });
    });

    it('should do nothing when index is the same as historyIndex', () => {
      jest.spyOn(history, '_selectItem');

      history._clickHistoryItem({ target });

      expect(history._selectItem).not.toHaveBeenCalled();
    });
  });

  describe('_selectItem', () => {
    let index, listLength;

    beforeEach(() => {
      history.add({ name, detail });
      history.add({ name, detail });
      index = 1;
      listLength = history.getListLength();
    });

    it('should select item', () => {
      jest.spyOn(history, 'addClass');
      jest.spyOn(history, 'removeClass');

      history._selectItem(index);

      expect(history.addClass).toHaveBeenCalledTimes(1);
      expect(history.addClass).toHaveBeenCalledWith(index, 'selected-item');
      expect(history.removeClass).toHaveBeenCalledTimes(listLength * 2);
    });
  });

  it('should destroy history instance', () => {
    history.destroy();

    Object.values(history).forEach((propValue) => {
      expect(propValue).toBeNull();
    });
  });

  it('should register an action and add event listener', () => {
    const actions = {};
    jest.spyOn(history, '_addHistoryEventListener');

    history.addEvent(actions);

    expect(history._addHistoryEventListener).toHaveBeenCalled();
    expect(history._actions).toEqual(actions);
  });

  it('should remove an action and event listener', () => {
    jest.spyOn(history, '_removeHistoryEventListener');

    history.removeEvent();

    expect(history._removeHistoryEventListener).toHaveBeenCalled();
  });
});
