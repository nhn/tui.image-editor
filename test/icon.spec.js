/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/icon.js"
 */
import Main from '../src/js/component/main';
import Icon from '../src/js/component/icon';

describe('Icon', () => {
    let canvas, main, mockImage, icon;

    beforeAll(() => {
        canvas = new fabric.Canvas($('<canvas>')[0]);
        main = new Main();
        main.canvas = canvas;
        icon = new Icon(main);
    });

    beforeEach(() => {
        mockImage = new fabric.Image();
        main.setCanvasImage('mockImage', mockImage);
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

        expect(activeObj.left).toEqual(centerPos.x);
        expect(activeObj.top).toEqual(centerPos.y);
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
