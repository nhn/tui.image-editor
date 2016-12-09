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

    describe('Promise is returned with settings and angle,', function() {
        beforeEach(function(done) {
            setTimeout(function() {
                mockImage.setAngle(10);
                done();
            }, 1);
        });

        it('flipX() is called.', function(done) {
            flipModule.flipX().then(function(obj) {
                expect(obj).toEqual({
                    setting: {
                        flipX: true,
                        flipY: false
                    },
                    angle: -10
                });
                done();
            });
        });

        it('flipY() is called.', function(done) {
            flipModule.flipY().then(function(obj) {
                expect(obj).toEqual({
                    setting: {
                        flipX: false,
                        flipY: true
                    },
                    angle: -10
                });
                done();
            });
        });

        it('flipY() is called.', function(done) {
            flipModule.flipY().then(function(obj) {
                expect(obj).toEqual({
                    setting: {
                        flipX: false,
                        flipY: true
                    },
                    angle: -10
                });
                done();
            });
        });

        it('set() is called.', function(done) {
            flipModule.set({flipX: true, flipY: false}).then(function(obj) {
                expect(obj).toEqual({
                    setting: {
                        flipX: true,
                        flipY: false
                    },
                    angle: -10
                });
                done();
            });
        });
    });
});
