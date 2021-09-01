import { fabric } from 'fabric';
import Graphics from '@/graphics';
import {
  setCachedUndoDataForDimension,
  getCachedUndoDataForDimension,
  makeSelectionUndoData,
  makeSelectionUndoDatum,
} from '@/helper/selectionModifyHelper';

describe('selectionModifyHelper', () => {
  let graphics, obj1, obj2;
  const rectOption = {
    width: 10,
    height: 10,
    top: 10,
    left: 10,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
  };

  beforeEach(() => {
    graphics = new Graphics(document.createElement('canvas'));
    obj1 = new fabric.Rect(rectOption);
    obj2 = new fabric.Rect(rectOption);
  });

  it('should set/get cached undo data', () => {
    const undoData = [{ id: 1 }];

    setCachedUndoDataForDimension(undoData);

    expect(getCachedUndoDataForDimension()).toEqual(undoData);
  });

  describe('makeSelectionUndoData', () => {
    it('should make object undo data', () => {
      const result = makeSelectionUndoData(obj1, (obj) => obj);

      expect(result).toEqual([obj1]);
    });

    it('should make selection undo data', () => {
      const selection = graphics.getActiveSelectionFromObjects([obj1, obj2]);

      const result = makeSelectionUndoData(selection, (obj) => obj);

      expect(result).toEqual([obj1, obj2]);
    });
  });

  describe('makeSelectionUndoDatum', () => {
    it('should return undo datum', () => {
      const result = makeSelectionUndoDatum(1, obj1, true);

      expect(result).toEqual({
        id: 1,
        width: obj1.width,
        height: obj1.height,
        top: obj1.top,
        left: obj1.left,
        angle: obj1.angle,
        scaleX: obj1.scaleX,
        scaleY: obj1.scaleY,
      });
    });
  });
});
