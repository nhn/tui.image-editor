/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/icon.js"
 */
import fabric from 'fabric';
import $ from 'jquery';
import Graphics from '../src/js/graphics';
import Icon from '../src/js/component/icon';

describe('Icon', () => {
    let canvas, graphics, mockImage, icon;

    beforeAll(() => {
        graphics = new Graphics($('<canvas>')[0]);
        canvas = graphics.getCanvas();
        icon = new Icon(graphics);
    });

    beforeEach(() => {
        mockImage = new fabric.Image();
        graphics.setCanvasImage('mockImage', mockImage);
    });

    afterEach(() => {
        canvas.forEachObject(obj => {
            canvas.remove(obj);
        });
    });

    it('add() should insert the activated icon object on canvas.', () => {
        icon.add('arrow');

        const activeObj = canvas.getActiveObject();

        expect(activeObj).not.toEqual(null);
    });

    it('add() should insert the icon object on center of canvas image.', () => {
        const centerPos = icon.getCanvasImage().getCenterPoint();

        icon.add('arrow');

        const activeObj = canvas.getActiveObject();
        const halfStrokeWidth = activeObj.strokeWidth / 2;

        expect(activeObj.left + halfStrokeWidth).toEqual(centerPos.x);
        expect(activeObj.top + halfStrokeWidth).toEqual(centerPos.y);
    });

    it('add() should create the arrow icon when parameter value is "arrow".', () => {
        const path = icon._pathMap.arrow;

        spyOn(icon, '_createIcon').and.returnValue(new fabric.Object({}));

        icon.add('arrow');

        expect(icon._createIcon).toHaveBeenCalledWith(path);
    });

    it('add() should create the cancel icon when parameter value is "cancel".', () => {
        const path = icon._pathMap.cancel;

        spyOn(icon, '_createIcon').and.returnValue(new fabric.Object({}));

        icon.add('cancel');

        expect(icon._createIcon).toHaveBeenCalledWith(path);
    });

    it('`_addWithDragEvent()` should be executed when `useDragAddIcon` is true.', () => {
        const defaultIconKey = 'icon-arrow';
        icon._pathMap[defaultIconKey] = true;

        spyOn(icon, '_createIcon').and.returnValue(new fabric.Object({}));
        spyOn(icon, '_addWithDragEvent');
        spyOn(icon, 'useDragAddIcon').and.returnValue(true);

        icon.add(defaultIconKey);

        expect(icon._addWithDragEvent).toHaveBeenCalled();
    });

    it('`_addWithDragEvent()` should be not executed when target icon is not default icon.', () => {
        const nonDefaultIconKey = 'non-default-icon';

        spyOn(icon, '_createIcon').and.returnValue(new fabric.Object({}));
        spyOn(icon, '_addWithDragEvent');
        spyOn(icon, 'useDragAddIcon').and.returnValue(true);

        icon.add(nonDefaultIconKey);

        expect(icon._addWithDragEvent).not.toHaveBeenCalled();
    });

    it('setColor() should change color of next inserted icon.', () => {
        let activeObj;
        const color = '#ffffff';

        icon.add('arrow');
        activeObj = canvas.getActiveObject();
        expect(activeObj.fill).not.toEqual(color);

        icon.setColor(color);

        icon.add('cancel');
        activeObj = canvas.getActiveObject();
        expect(activeObj.fill).toEqual(color);
    });
});
