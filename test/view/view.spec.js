'use strict';

var ViewInterface = require('./../../src/js/interface/view');

describe('Interface: View', function() {
    var instance;

    beforeEach(function() {
        instance = new ViewInterface();
    });

    describe('getName', function() {
        it('should throw an error if nameless', function() {
            expect(function() {
                instance.getName();
            }).toThrowError();
        });

        it('should return name if named', function() {
            instance.name = 'test';
            expect(instance.getName()).toEqual('test');
        });
    });

    describe('getElement', function() {
        it('should return falsy if does not have an element', function() {
            expect(instance.getElement()).toBeFalsy();
        });

        it('should return element if has', function() {
            var $element = $('<div />');

            instance.$element = $element;
            expect(instance.getElement()).toEqual($element);
        });
    });

    describe('destroy', function() {
        it('should remove the element', function() {
            instance.$element = $('<div />');
            instance.destroy();

            expect(instance.getElement()).toBeFalsy();
        });
    });

    describe('doAftereRender', function() {
        beforeEach(function() {
            instance.template = function() {};
        });

        it('shuold call if exists', function() {
            instance.doAfterRender = jasmine.createSpy();
            instance.render();

            expect(instance.doAfterRender).toHaveBeenCalled();
        });
    });

    describe('doBeforeDestroy', function() {
        it('should call if exists', function() {
            instance.doBeforeDestroy = jasmine.createSpy();
            instance.destroy();

            expect(instance.doBeforeDestroy).toHaveBeenCalled();
        });
    });
});
