/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/component/flip.js"
 */
'use strict';

var Main = require('../src/js/component/main');
var Flip = require('../src/js/component/flip');

describe('Flip', function() {
    var main, flipModule, mockImage;

    beforeAll(function() {
        main = new Main();
        flipModule = new Flip(main);
        main.canvas = new fabric.Canvas($('<canvas>')[0]);
    });

    beforeEach(function() {
        mockImage = new fabric.Image();
        main.setCanvasImage('mockImage', mockImage);
    });

    it('"getCurrentSetting()" should return current flip-setting', function() {
        var setting = flipModule.getCurrentSetting();

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

    it('"set()" should set flip-setting', function() {
        flipModule.set({
            flipX: false,
            flipY: true
        });

        expect(flipModule.getCurrentSetting()).toEqual({
            flipX: false,
            flipY: true
        });
    });

    it('"reset()" should reset flip-setting to false', function() {
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

    it('"flipX()" should toggle flipX', function() {
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

    it('"flipY()" should toggle flipY', function() {
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

    it('flipX(), flipY(), set(), reset() should resolve with angle', function() {
        var spy = jasmine.createSpy();
        mockImage.setAngle(10);

        flipModule.flipX().done(spy);
        expect(spy).toHaveBeenCalledWith({
            flipX: true,
            flipY: false
        }, -10);

        spy.calls.reset();
        flipModule.flipY().done(spy);
        expect(spy).toHaveBeenCalledWith({
            flipX: true,
            flipY: true
        }, 10);

        spy.calls.reset();
        flipModule.set({flipX: true, flipY: false}).done(spy);
        expect(spy).toHaveBeenCalledWith({
            flipX: true,
            flipY: false
        }, -10);

        spy.calls.reset();
        flipModule.set({flipX: false, flipY: false}).done(spy);
        expect(spy).toHaveBeenCalledWith({
            flipX: false,
            flipY: false
        }, 10);
    });
});
