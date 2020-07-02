/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/text.js"
 */
import fabric from 'fabric';
import $ from 'jquery';
import Graphics from '../src/js/graphics';
import Text from '../src/js/component/text';

describe('Text', () => {
    let canvas, graphics, mockImage, text;

    beforeAll(() => {
        graphics = new Graphics($('<canvas>')[0]);
        canvas = graphics.getCanvas();
        text = new Text(graphics);
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

    describe('add()', () => {
        let activeObj;

        beforeEach(() => {
            text.add('', {});

            activeObj = canvas.getActiveObject();
        });

        it('should make the blank text object when text parameter is empty string.', () => {
            const newText = activeObj.text;

            expect(newText).toEqual('');
        });

        it('should make the text object set default option when parameter has not "styles" property.', () => {
            const newTextStyle = activeObj.fontWeight;

            expect(newTextStyle).toEqual('normal');
        });

        it('should create the text object on center of canvas when parameter has not "position" property.', () => {
            const mockImagePos = mockImage.getCenterPoint();

            expect(activeObj.left).toEqual(mockImagePos.x);
            expect(activeObj.top).toEqual(mockImagePos.y);
        });

        it('Default option for autofocus should be true when adding text.', done => {
            text.add('default', {}).then(info => {
                const newText = graphics.getObject(info.id);

                expect(newText.selectionStart).toBe(0);
                expect(newText.selectionEnd).toBe(7);
                expect(newText.isEditing).toBe(true);

                done();
            });
        });
    });

    it('Rotated text elements must also maintain consistent left and top positions after entering and exiting drawing mode.', () => {
        const left = 10;
        const top = 20;
        const newText = new fabric.IText('testString', {
            left,
            top,
            width: 30,
            height: 50,
            angle: 40,
            originX: 'center',
            originY: 'center'
        });
        text.useItext = true;
        canvas.add(newText);

        text.start();
        text.end();

        expect(newText.left).toEqual(left);
        expect(newText.top).toEqual(top);
    });

    it('change() should change contents in the text object as input.', () => {
        text.add('text123', {});

        const activeObj = canvas.getActiveObject();

        text.change(activeObj, 'abc');

        expect(activeObj.text).toEqual('abc');

        text.change(activeObj, 'def');

        expect(activeObj.text).toEqual('def');
    });

    describe('setStyle()', () => {
        beforeEach(() => {
            text.add('new text', {
                styles: {
                    fontWeight: 'bold'
                }
            });
        });

        it('should unlock style when a selected style already apply on the activated text object.', () => {
            const activeObj = canvas.getActiveObject();

            text.setStyle(activeObj, {
                fontWeight: 'bold'
            });

            expect(activeObj.fontWeight).not.toEqual('bold');
        });

        it('should apply style when the activated text object has not a selected style.', () => {
            const activeObj = canvas.getActiveObject();

            text.setStyle(activeObj, {
                fontStyle: 'italic'
            });

            expect(activeObj.fontStyle).toEqual('italic');
        });
    });

    it('_onFabricScaling() should change size of selected text object.', () => {
        const obj = new fabric.Text('test');
        const mock = {
            target: obj
        };
        const scale = 10;
        const originSize = obj.fontSize;

        text.start({});

        canvas.add(obj);
        obj.scaleY = scale;

        canvas.fire('object:scaling', mock);

        expect(obj.fontSize).toEqual(originSize * scale);
    });
});
