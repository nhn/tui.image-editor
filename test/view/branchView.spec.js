'use strict';

var mixer = require('./../../src/js/mixin/mixer');

describe('View Extension: ViewBranch', function() {
    var View = tui.util.defineClass({
            init: function(name) {
                this.name = name;
                this.$element = $('<div />');
            },

            getElement: function() {
                return this.$element;
            },

            getName: function() {
                return this.name;
            },

            render: function() {},

            destroy: function() {}
        }),
        view, child1;

    mixer.mixin(View, 'BranchView');

    beforeEach(function() {
        view = new View();
        child1 = new View('child1');
    });

    describe('addChild', function() {
        it('should append child', function() {
            view.addChild(child1);

            expect(view._children.child1).toEqual(child1);
        });

        it('should append element', function() {
            view.addChild(child1);

            expect(
                $.contains(view.$element[0], child1.$element[0])
            ).toBe(true);
        });
    });

    describe('removeChild', function() {
        beforeEach(function() {
            view.addChild(child1);
        });

        it('should remove child', function() {
            view.removeChild('child1');
            expect(view._children.child1).toBeUndefined();
        });

        it('should destroy child', function() {
            spyOn(child1, 'destroy');
            view.removeChild('child1');

            expect(child1.destroy).toHaveBeenCalled();
        });
    });

    describe('clearChildren', function() {
        var child2;

        beforeEach(function() {
            child2 = new View('child2');
            view.addChild(child1);
            view.addChild(child2);
        });

        it('should remove all children', function() {
            view.clearChildren();

            expect(view._children).toEqual({});
        });

        it('should destroy all children', function() {
            spyOn(child1, 'destroy');
            spyOn(child2, 'destroy');
            view.clearChildren();

            expect(child1.destroy).toHaveBeenCalled();
            expect(child2.destroy).toHaveBeenCalled();
        });
    });
});
