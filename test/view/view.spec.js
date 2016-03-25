'use strict';

var ViewInterface = require('./../../src/js/interface/view');

describe('Interface: View', function() {
    var instance;

    beforeEach(function() {
        instance = new ViewInterface();
    });

    it('should have unimplemented methods', function() {
        expect(function() {
            instance.render();
        }).toThrowError(/template/);

        expect(function() {
            instance.postCommand();
        }).toThrowError(/postCommand/);
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
        it('should throw an error if does not have an element', function() {
            expect(function() {
                instance.getElement();
            }).toThrowError();
        });

        it('should return element if has', function() {
            var $element = $('<div />');

            instance.$element = $element;
            expect(instance.getElement()).toEqual($element);
        });
    });

    describe('destroy', function() {
        it('should remove element', function() {
            instance.$element = $('<div />');
            instance.destroy();

            expect(function() {
                instance.getElement();
            }).toThrowError();
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

        it('should not throw error if not exists', function() {
            expect(function() {
                instance.render();
            }).not.toThrowError();
        });
    });

    describe('doBeforeDestroy', function() {
        it('should call if exists', function() {
            instance.doBeforeDestroy = jasmine.createSpy();
            instance.destroy();

            expect(instance.doBeforeDestroy).toHaveBeenCalled();
        });

        it('should not throw error if not exists', function() {
            expect(function() {
                instance.destroy();
            }).not.toThrowError();
        });
    });
});
