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

    describe('_createTextarea()', () => {
        let $textarea;

        beforeEach(() => {
            text._createTextarea();

            $textarea = $(text.getCanvasElement().parentNode).find('textarea');
        });

        afterEach(() => {
            text._removeTextarea();
        });

        it('should attach the created "textarea" element on canvas container.', () => {
            expect($textarea.length).toEqual(1);
        });

        it('should have class name.', () => {
            const expected = 'tui-image-eidtor-textarea';

            expect($textarea.attr('class')).toEqual(expected);
        });

        it('should add inline style on "textarea" element.', () => {
            expect($textarea.attr('style')).not.toEqual(null);
        });
    });

    it('_removeTextarea() should remove "textarea" element on canvas container.', () => {
        text._createTextarea();
        text._removeTextarea();

        const $textarea = $(text.getCanvasElement().parentNode).find('textarea');

        expect($textarea.length).toEqual(0);
    });

    it('_onBlur() should hide the "textarea" element.', () => {
        const obj = new fabric.Text('test');

        text._createTextarea();

        const $textarea = $(text.getCanvasElement().parentNode).find('textarea');

        text._editingObj = obj;

        canvas.add(obj);

        text._onBlur();

        expect($textarea.css('display')).toEqual('none');
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

    describe('_changeToEditingMode()', () => {
        let textarea;
        const ratio = 10;
        const expected = {
            fontSize: 12,
            fontFamily: 'Comic Sans',
            fontStyle: 'italic',
            fontWeight: '700',
            textAlign: 'right',
            lineHeight: '3'
        };
        const obj = new fabric.Text('test', expected);

        beforeEach(() => {
            text._createTextarea();

            textarea = text._textarea;

            canvas.add(obj);

            spyOn(text, 'getCanvasRatio').and.returnValue(ratio);

            text._changeToEditingMode(obj);
        });

        afterEach(() => {
            text._removeTextarea();
        });

        it('should change selected text object into textarea.', () => {
            expect(textarea.style.display).not.toEqual('none');
        });

        it('should set style of textarea by selected text object.', () => {
            const textareaStyles = textarea.style;

            expect(textareaStyles['font-size']).toEqual(`${expected.fontSize / ratio}px`);
            expect(textareaStyles['font-family'].replace(/'|"|\\/g, '')).toEqual(expected.fontFamily);
            expect(textareaStyles['font-weight']).toEqual(expected.fontWeight);
            expect(textareaStyles['font-align']).toEqual(expected.fontAlign);
            expect(textareaStyles['line-height']).toEqual(obj.lineHeight + 0.1);
        });
    });
});
