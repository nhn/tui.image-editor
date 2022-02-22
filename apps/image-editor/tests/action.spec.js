import { fabric } from 'fabric';
import ImageEditor from '@/imageEditor';

import '@/command/loadImage';

describe('UI', () => {
  let actions, imageEditorMock, mockImage;

  beforeEach(() => {
    imageEditorMock = new ImageEditor(document.createElement('div'), {
      includeUI: {
        loadImage: false,
        initMenu: 'flip',
        menuBarPosition: 'bottom',
        applyCropSelectionStyle: true,
      },
    });
    actions = imageEditorMock.getActions();
    mockImage = new fabric.Image();
    imageEditorMock._graphics.setCanvasImage('mockImage', mockImage);
  });

  describe('mainAction', () => {
    let mainAction;

    beforeEach(() => {
      mainAction = actions.main;
    });

    it('should be executed When the initLoadImage action occurs', async () => {
      const loadImageFromURLSpy = jest
        .spyOn(imageEditorMock, 'loadImageFromURL')
        .mockReturnValue(Promise.resolve(300));
      const clearUndoStackSpy = jest.spyOn(imageEditorMock, 'clearUndoStack');
      const resizeEditorSpy = jest.spyOn(imageEditorMock.ui, 'resizeEditor');

      await mainAction.initLoadImage('path', 'imageName');

      expect(loadImageFromURLSpy).toHaveBeenCalled();
      expect(clearUndoStackSpy).toHaveBeenCalled();
      expect(resizeEditorSpy).toHaveBeenCalled();
    });

    it('should be executed When the undo action occurs', () => {
      jest.spyOn(imageEditorMock, 'isEmptyUndoStack').mockReturnValue(false);
      const undoSpy = jest.spyOn(imageEditorMock, 'undo').mockReturnValue({ then: () => {} });

      mainAction.undo();

      expect(undoSpy).toHaveBeenCalled();
    });

    it('should be executed When the redo action occurs', () => {
      jest.spyOn(imageEditorMock, 'isEmptyRedoStack').mockReturnValue(false);
      const redoSpy = jest.spyOn(imageEditorMock, 'redo').mockReturnValue({ then: () => {} });

      mainAction.redo();

      expect(redoSpy).toHaveBeenCalled();
    });

    it('should be executed When the delete action occurs', () => {
      imageEditorMock.activeObjectId = 10;
      imageEditorMock.removeActiveObject = jest.fn();

      mainAction.delete();

      expect(imageEditorMock.removeActiveObject).toHaveBeenCalled();
      expect(imageEditorMock.activeObjectId).toBeNull();
    });

    it('should be run and the enabled state should be changed When the deleteAll action occurs', () => {
      imageEditorMock.clearObjects = jest.fn();
      const changeHelpButtonEnabledSpy = jest.spyOn(imageEditorMock.ui, 'changeHelpButtonEnabled');

      mainAction.deleteAll();

      expect(imageEditorMock.clearObjects).toHaveBeenCalled();
      expect(changeHelpButtonEnabledSpy).toHaveBeenNthCalledWith(1, 'delete', false);
      expect(changeHelpButtonEnabledSpy).toHaveBeenNthCalledWith(2, 'deleteAll', false);
    });

    it('should be executed When the load action occurs', async () => {
      const loadImageFromFileSpy = jest
        .spyOn(imageEditorMock, 'loadImageFromFile')
        .mockReturnValue(Promise.resolve());
      const clearUndoStackSpy = jest.spyOn(imageEditorMock, 'clearUndoStack');
      const resizeEditorSpy = jest.spyOn(imageEditorMock.ui, 'resizeEditor');

      global.URL.createObjectURL = jest.fn();

      await mainAction.load();

      expect(loadImageFromFileSpy).toHaveBeenCalled();
      expect(clearUndoStackSpy).toHaveBeenCalled();
      expect(resizeEditorSpy).toHaveBeenCalled();
    });
  });

  describe('shapeAction', () => {
    let shapeAction;

    beforeEach(() => {
      shapeAction = actions.shape;
    });

    it('should be executed When the changeShape action occurs', () => {
      imageEditorMock.activeObjectId = 10;
      imageEditorMock.changeShape = jest.fn();

      shapeAction.changeShape({ strokeWidth: '#000000' });

      expect(imageEditorMock.changeShape).toHaveBeenCalledWith(
        10,
        { strokeWidth: '#000000' },
        undefined
      );
    });

    it('should be executed When the setDrawingShape action occurs', () => {
      imageEditorMock.setDrawingShape = jest.fn();

      shapeAction.setDrawingShape();

      expect(imageEditorMock.setDrawingShape).toHaveBeenCalled();
    });
  });

  describe('cropAction', () => {
    let cropAction;

    beforeEach(() => {
      cropAction = actions.crop;
    });

    it('should be executed when the crop action occurs', async () => {
      const getCropzoneRectSpy = jest
        .spyOn(imageEditorMock, 'getCropzoneRect')
        .mockReturnValue(true);
      const cropSpy = jest.spyOn(imageEditorMock, 'crop').mockReturnValue(Promise.resolve());
      const stopDrawingModeSpy = jest.spyOn(imageEditorMock, 'stopDrawingMode');
      imageEditorMock.ui.changeMenu = jest.fn();

      await cropAction.crop();

      expect(getCropzoneRectSpy).toHaveBeenCalled();
      expect(cropSpy).toHaveBeenCalled();
      expect(stopDrawingModeSpy).toHaveBeenCalled();
    });

    it('should be executed When the cancel action occurs', () => {
      const stopDrawingModeSpy = jest.spyOn(imageEditorMock, 'stopDrawingMode');
      imageEditorMock.ui.changeMenu = jest.fn();

      cropAction.cancel();

      expect(stopDrawingModeSpy).toHaveBeenCalled();
      expect(imageEditorMock.ui.changeMenu).toHaveBeenCalled();
    });
  });

  describe('flipAction', () => {
    let flipAction;

    beforeEach(() => {
      flipAction = actions.flip;
    });

    it('should be executed When the flip(flipType) action occurs', () => {
      imageEditorMock.flipX = jest.fn();
      imageEditorMock.flipY = jest.fn();

      flipAction.flip('flipX');
      expect(imageEditorMock.flipX).toHaveBeenCalled();

      flipAction.flip('flipY');
      expect(imageEditorMock.flipY).toHaveBeenCalled();
    });
  });

  describe('rotateAction', () => {
    let rotateAction;

    beforeEach(() => {
      rotateAction = actions.rotate;
    });

    it('should be executed When the rotate action occurs', () => {
      const resizeEditorSpy = jest.spyOn(imageEditorMock.ui, 'resizeEditor');
      imageEditorMock.rotate = jest.fn();

      rotateAction.rotate(30);

      expect(imageEditorMock.rotate).toHaveBeenCalledWith(30, undefined);
      expect(resizeEditorSpy).toHaveBeenCalled();
    });

    it('should be executed When the setAngle action occurs', () => {
      const resizeEditorSpy = jest.spyOn(imageEditorMock.ui, 'resizeEditor');
      imageEditorMock.setAngle = jest.fn();

      rotateAction.setAngle(30);

      expect(imageEditorMock.setAngle).toHaveBeenCalledWith(30, undefined);
      expect(resizeEditorSpy).toHaveBeenCalled();
    });
  });

  describe('textAction', () => {
    let textAction;

    beforeEach(() => {
      textAction = actions.text;
    });

    it('should be executed When the changeTextStyle action occurs', () => {
      imageEditorMock.activeObjectId = 10;
      imageEditorMock.changeTextStyle = jest.fn();

      textAction.changeTextStyle({ fontSize: 10 });

      expect(imageEditorMock.changeTextStyle).toHaveBeenCalledWith(10, { fontSize: 10 }, undefined);
    });
  });

  describe('maskAction', () => {
    let maskAction;

    beforeEach(() => {
      maskAction = actions.mask;
    });

    it('should be executed When the applyFilter action occurs', () => {
      imageEditorMock.activeObjectId = 10;
      imageEditorMock.applyFilter = jest.fn();
      jest.spyOn(imageEditorMock, 'applyFilter');

      maskAction.applyFilter();

      expect(imageEditorMock.applyFilter).toHaveBeenCalledWith('mask', { maskObjId: 10 });
    });
  });

  describe('drawAction', () => {
    let drawAction;

    beforeEach(() => {
      drawAction = actions.draw;
    });

    it('should be executed When the setDrawMode("free") action occurs', () => {
      imageEditorMock.startDrawingMode = jest.fn();
      drawAction.setDrawMode('free');

      expect(imageEditorMock.startDrawingMode).toHaveBeenCalledWith('FREE_DRAWING', undefined);
    });

    it('should be executed When the setColor() action occurs', () => {
      imageEditorMock.setBrush = jest.fn();
      drawAction.setColor('#000000');

      expect(imageEditorMock.setBrush).toBeCalledWith({ color: '#000000' });
    });
  });

  describe('iconAction', () => {
    let iconAction;

    beforeEach(() => {
      iconAction = actions.icon;
    });

    it('should run drawing mode when the add icon occurs', () => {
      const startDrawingModeSpy = jest.spyOn(imageEditorMock, 'startDrawingMode');
      const setDrawingIconSpy = jest.spyOn(imageEditorMock, 'setDrawingIcon');

      iconAction.addIcon('iconTypeA', '#fff');

      expect(startDrawingModeSpy).toHaveBeenCalledWith('ICON');
      expect(setDrawingIconSpy).toHaveBeenCalledWith('iconTypeA', '#fff');
    });
  });

  describe('filterAction', () => {
    let filterAction;

    beforeEach(() => {
      filterAction = actions.filter;
    });

    it('should be executed When the type of applyFilter is false', () => {
      imageEditorMock.removeFilter = jest.fn();
      jest.spyOn(imageEditorMock, 'hasFilter').mockReturnValue(true);

      filterAction.applyFilter(false, {});

      expect(imageEditorMock.removeFilter).toHaveBeenCalled();
    });

    it('should be executed When the type of applyFilter is true', () => {
      imageEditorMock.applyFilter = jest.fn();

      filterAction.applyFilter(true, {});

      expect(imageEditorMock.applyFilter).toHaveBeenCalled();
    });
  });

  describe('commonAction', () => {
    it('should return to the getActions method must contain commonAction.', () => {
      ['shape', 'crop', 'flip', 'rotate', 'text', 'mask', 'draw', 'icon', 'filter'].forEach(
        (submenu) => {
          expect(actions[submenu].modeChange).toBeDefined();
          expect(actions[submenu].deactivateAll).toBeDefined();
          expect(actions[submenu].changeSelectableAll).toBeDefined();
          expect(actions[submenu].discardSelection).toBeDefined();
          expect(actions[submenu].stopDrawingMode).toBeDefined();
        }
      );
    });

    describe('modeChange()', () => {
      let commonAction;

      beforeEach(() => {
        commonAction = actions.main;
      });

      it('should be executed When the modeChange("text") action occurs', () => {
        const changeActivateModeSpy = jest.spyOn(imageEditorMock, '_changeActivateMode');

        commonAction.modeChange('text');

        expect(changeActivateModeSpy).toHaveBeenCalledWith('TEXT');
      });

      it('should be executed When the modeChange("crop") action occurs', () => {
        const startDrawingModeSpy = jest.spyOn(imageEditorMock, 'startDrawingMode');

        commonAction.modeChange('crop');

        expect(startDrawingModeSpy).toHaveBeenCalledWith('CROPPER');
      });

      it('should be executed When the modeChange("shape") action occurs', () => {
        const setDrawingShapeSpy = jest.spyOn(imageEditorMock, 'setDrawingShape');
        const changeActivateModeSpy = jest.spyOn(imageEditorMock, '_changeActivateMode');

        commonAction.modeChange('shape');

        expect(setDrawingShapeSpy).toHaveBeenCalled();
        expect(changeActivateModeSpy).toHaveBeenCalledWith('SHAPE');
      });
    });
  });

  describe('reAction', () => {
    let changeHelpButtonEnabledSpy;

    beforeEach(() => {
      imageEditorMock.setReAction();
      changeHelpButtonEnabledSpy = jest.spyOn(imageEditorMock.ui, 'changeHelpButtonEnabled');
    });

    describe('undoStackChanged', () => {
      it('should be true if the undo stack has a length greater than zero', () => {
        imageEditorMock.fire('undoStackChanged', 1);

        expect(changeHelpButtonEnabledSpy).toHaveBeenNthCalledWith(1, 'undo', true);
        expect(changeHelpButtonEnabledSpy).toHaveBeenNthCalledWith(2, 'reset', true);
      });

      it('should be false if the undo stack has a length of 0', () => {
        imageEditorMock.fire('undoStackChanged', 0);

        expect(changeHelpButtonEnabledSpy).toHaveBeenNthCalledWith(1, 'undo', false);
        expect(changeHelpButtonEnabledSpy).toHaveBeenNthCalledWith(2, 'reset', false);
      });
    });

    describe('redoStackChanged', () => {
      it('should be true if the redo stack is greater than 0 length', () => {
        imageEditorMock.fire('redoStackChanged', 1);

        expect(changeHelpButtonEnabledSpy).toHaveBeenNthCalledWith(1, 'redo', true);
      });

      it('should be false if the redo stack has a length of 0', () => {
        imageEditorMock.fire('redoStackChanged', 0);

        expect(changeHelpButtonEnabledSpy).toHaveBeenNthCalledWith(1, 'redo', false);
      });
    });

    describe('objectActivated', () => {
      it('should be enabled when objectActivated occurs', () => {
        imageEditorMock.fire('objectActivated', { id: 1 });

        expect(changeHelpButtonEnabledSpy).toHaveBeenNthCalledWith(1, 'delete', true);
        expect(changeHelpButtonEnabledSpy).toHaveBeenNthCalledWith(2, 'deleteAll', true);
      });

      it('should be enabled when objectActivated target is cropzone', () => {
        const changeApplyButtonStatusSpy = jest.spyOn(
          imageEditorMock.ui.crop,
          'changeApplyButtonStatus'
        );
        imageEditorMock.fire('objectActivated', { id: 1, type: 'cropzone' });

        expect(changeApplyButtonStatusSpy).toHaveBeenCalledWith(true);
      });

      it('should be changed to shape if the target of objectActivated is shape and the existing menu is not shape', () => {
        imageEditorMock.ui.submenu = 'crop';
        imageEditorMock.ui.changeMenu = jest.fn();
        imageEditorMock.ui.shape.setShapeStatus = jest.fn();
        const setMaxStrokeValueSpy = jest.spyOn(imageEditorMock.ui.shape, 'setMaxStrokeValue');

        imageEditorMock.fire('objectActivated', { id: 1, type: 'circle' });

        expect(imageEditorMock.ui.changeMenu).toHaveBeenCalledWith('shape', false, false);
        expect(setMaxStrokeValueSpy).toHaveBeenCalled();
      });

      it('should be changed to text if the target of objectActivated is text and the existing menu is not text', () => {
        imageEditorMock.ui.submenu = 'crop';
        imageEditorMock.ui.changeMenu = jest.fn();

        imageEditorMock.fire('objectActivated', { id: 1, type: 'i-text' });

        expect(imageEditorMock.ui.changeMenu).toHaveBeenCalledWith('text', false, false);
      });

      it('should be changed to icon if the target of objectActivated is icon and the existing menu is not icon', () => {
        imageEditorMock.ui.submenu = 'crop';
        imageEditorMock.ui.changeMenu = jest.fn();
        const setIconPickerColorSpy = jest.spyOn(imageEditorMock.ui.icon, 'setIconPickerColor');

        imageEditorMock.fire('objectActivated', { id: 1, type: 'icon' });

        expect(imageEditorMock.ui.changeMenu).toHaveBeenCalledWith('icon', false, false);
        expect(setIconPickerColorSpy).toHaveBeenCalled();
      });
    });

    describe('addObjectAfter', () => {
      it('should be changed to match the size of the added object when addObjectAfter occurs', () => {
        const setMaxStrokeValueSpy = jest.spyOn(imageEditorMock.ui.shape, 'setMaxStrokeValue');
        imageEditorMock.ui.shape.changeStandbyMode = jest.fn();

        imageEditorMock.fire('addObjectAfter', { type: 'circle', width: 100, height: 200 });

        expect(setMaxStrokeValueSpy).toHaveBeenCalledWith(100);
        expect(imageEditorMock.ui.shape.changeStandbyMode).toHaveBeenCalled();
      });
    });

    describe('objectScaled', () => {
      it('should be changed if objectScaled occurs on an object of type text', () => {
        imageEditorMock.ui.text.fontSize = 0;

        imageEditorMock.fire('objectScaled', { type: 'i-text', fontSize: 20 });

        expect(imageEditorMock.ui.text.fontSize).toBe(20);
      });

      it('should be changed if objectScaled is for a shape type object and strokeValue is greater than the size of the object', () => {
        jest.spyOn(imageEditorMock.ui.shape, 'getStrokeValue').mockReturnValue(20);
        const setStrokeValueSpy = jest.spyOn(imageEditorMock.ui.shape, 'setStrokeValue');

        imageEditorMock.fire('objectScaled', { type: 'rect', width: 10, height: 10 });

        expect(setStrokeValueSpy).toHaveBeenCalledWith(10);
      });
    });

    describe('selectionCleared', () => {
      it('should be closed if selectionCleared occurs in the text menu state', () => {
        imageEditorMock.ui.submenu = 'text';
        const changeCursorSpy = jest.spyOn(imageEditorMock, 'changeCursor');

        imageEditorMock.fire('selectionCleared');

        expect(changeCursorSpy).toHaveBeenCalledWith('text');
      });
    });
  });
});
