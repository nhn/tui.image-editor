var BranchView = require('./../../src/js/interface/branchView');

describe('View Extension: ViewBranch', function() {
    var ViewClass, view, childMock;

    beforeEach(function() {
        ViewClass = function() {
            this.$element = $('<div />');
            this.getElement = function() {
                return this.$element;
            };
        };
        childMock = {
            $element: $('<div />'),
            getName: function() {
                return 'mock';
            },
            getElement: function() {
                return this.$element;
            },
            destroy: jasmine.createSpy()
        };
        BranchView.mixin(ViewClass);

        view = new ViewClass();
    });

    describe('addChild', function() {
        it('should append child', function() {
            view.addChild(childMock);

            expect(view._children.mock).toEqual(childMock);
        });

        it('should append element', function() {
            view.addChild(childMock);

            expect(
                $.contains(view.$element[0], childMock.$element[0])
            ).toBe(true);
        });
    });

    describe('removeChild', function() {
        beforeEach(function() {
            view.addChild(childMock);
        });

        it('should remove child', function() {
            view.removeChild('mock');
            expect(view._children.mock).toBeUndefined();
        });

        it('should destroy child', function() {
            view.removeChild('mock');
            expect(childMock.destroy).toHaveBeenCalled();
        });
    });

    describe('clearChildren', function() {
        var childMock2;

        beforeEach(function() {
            childMock2 = {
                $element: $('<div />'),
                getName: function() {
                    return 'mock2';
                },
                getElement: function() {
                    return this.$element;
                },
                destroy: jasmine.createSpy()
            };
            view.addChild(childMock);
            view.addChild(childMock2);
        });

        it('should remove all children', function() {
            view.clearChildren();

            expect(view._children).toEqual({});
        });

        it('should destroy all children', function() {
            view.clearChildren();

            expect(childMock.destroy).toHaveBeenCalled();
            expect(childMock2.destroy).toHaveBeenCalled();
        });
    });
});
