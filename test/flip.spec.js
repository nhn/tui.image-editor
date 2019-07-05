/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Test cases of "src/js/component/flip.js"
 */
import fabric from 'fabric';
import $ from 'jquery';
import Graphics from '../src/js/graphics';
import Flip from '../src/js/component/flip';

describe('Flip', () => {
    let graphics, flipModule, mockImage;

    beforeAll(() => {
        graphics = new Graphics($('<canvas>')[0]);
        flipModule = new Flip(graphics);
    });

    beforeEach(() => {
        mockImage = new fabric.Image();
        graphics.setCanvasImage('mockImage', mockImage);
    });

    it('"getCurrentSetting()" should return current flip-setting', () => {
        let setting = flipModule.getCurrentSetting();

        expect(setting).toEqual({
            flipX: false,
            flipY: false
        });

        mockImage.set({flipX: true});
        setting = flipModule.getCurrentSetting();
        expect(setting).toEqual({
            flipX: true,
            flipY: false
        });
    });

    it('"set()" should set flip-setting', () => {
        flipModule.set({
            flipX: false,
            flipY: true
        });

        expect(flipModule.getCurrentSetting()).toEqual({
            flipX: false,
            flipY: true
        });
    });

    it('"reset()" should reset flip-setting to false', () => {
        mockImage.set({
            flipX: true,
            flipY: true
        });
        flipModule.reset();

        expect(flipModule.getCurrentSetting()).toEqual({
            flipX: false,
            flipY: false
        });
    });

    it('"flipX()" should toggle flipX', () => {
        flipModule.flipX();

        expect(flipModule.getCurrentSetting()).toEqual({
            flipX: true,
            flipY: false
        });

        flipModule.flipX();

        expect(flipModule.getCurrentSetting()).toEqual({
            flipX: false,
            flipY: false
        });
    });

    it('"flipY()" should toggle flipY', () => {
        flipModule.flipY();

        expect(flipModule.getCurrentSetting()).toEqual({
            flipX: false,
            flipY: true
        });

        flipModule.flipY();

        expect(flipModule.getCurrentSetting()).toEqual({
            flipX: false,
            flipY: false
        });
    });

    describe('Promise is returned with settings and angle,', () => {
        beforeEach(() => {
            mockImage.angle = 10;
        });

        it('flipX() is called.', done => {
            flipModule.flipX().then(obj => {
                expect(obj).toEqual({
                    flipX: true,
                    flipY: false,
                    angle: -10
                });
                done();
            });
        });

        it('flipY() is called.', done => {
            flipModule.flipY().then(obj => {
                expect(obj).toEqual({
                    flipX: false,
                    flipY: true,
                    angle: -10
                });
                done();
            });
        });

        it('flipY() is called.', done => {
            flipModule.flipY().then(obj => {
                expect(obj).toEqual({
                    flipX: false,
                    flipY: true,
                    angle: -10
                });
                done();
            });
        });

        it('set() is called.', done => {
            flipModule.set({
                flipX: true,
                flipY: false
            }).then(obj => {
                expect(obj).toEqual({
                    flipX: true,
                    flipY: false,
                    angle: -10
                });
                done();
            });
        });
    });
});
