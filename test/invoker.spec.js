/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/invoker.js"
 */
'use strict';

var Promise = require('core-js/library/es6/promise');
var Invoker = require('../src/js/invoker'),
    Command = require('../src/js/interface/command');

describe('Invoker', function() {
    var component = {
        getName: function() {
            return 'foo';
        },
        action: function() {}
    };
    var invoker, cmd;

    beforeEach(function() {
        invoker = new Invoker();
        invoker._register(component);

        cmd = new Command({
            execute: jasmine.createSpy().and.returnValue(Promise.resolve()),
            undo: jasmine.createSpy().and.returnValue(Promise.resolve())
        });
    });

    it('should inject registered components to "command.execute"', function() {
        invoker.invoke(cmd);

        expect(cmd.execute).toHaveBeenCalledWith(jasmine.objectContaining({
            foo: component
        }));
    });

    it('should inject registered components to "command.undo"', function(done) {
        invoker.invoke(cmd).then(function() {
            return invoker.undo();
        }).then(function() {
            expect(cmd.undo).toHaveBeenCalledWith(jasmine.objectContaining({
                foo: component
            }));
            done();
        });
    });

    it('"redo()" should call "command.execute" again', function(done) {
        invoker.invoke(cmd).then(function() {
            return invoker.undo();
        }).then(function() {
            cmd.execute.calls.reset();

            return invoker.redo();
        }).then(function() {
            expect(cmd.execute).toHaveBeenCalled();
            done();
        });
    });

    it('should call the "command.executeCallback" after invoke', function(done) {
        var spyCallback = jasmine.createSpy();

        cmd.setExecuteCallback(spyCallback);
        invoker.invoke(cmd).then(function() {
            expect(spyCallback).toHaveBeenCalled();
            done();
        });
    });

    it('should call the "command.undoCallback" after undo', function(done) {
        var spyCallback = jasmine.createSpy();

        cmd.setUndoCallback(spyCallback);
        invoker.invoke(cmd).then(function() {
            return invoker.undo();
        }).then(function() {
            expect(spyCallback).toHaveBeenCalled();
            done();
        });
    });

    describe('invoker.customEvents', function() {
        var spyEvents;

        beforeEach(function() {
            spyEvents = {
                pushUndoStack: jasmine.createSpy(),
                pushRedoStack: jasmine.createSpy(),
                emptyUndoStack: jasmine.createSpy(),
                emptyRedoStack: jasmine.createSpy()
            };
        });

        it('"invoke()" should fire a event - ' +
            ' "pushUndoStack" (when redoStack is empty before)"', function(done) {
            invoker.on(spyEvents);
            invoker.invoke(cmd).then(function() {
                expect(spyEvents.pushUndoStack).toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
                done();
            });
        });

        it('"invoke()" should fire events - ' +
            ' "pushUndoStack", "clearRedoStack" (when redoStack is not empty before)', function(done) {
            invoker.pushRedoStack({});

            invoker.on(spyEvents);
            invoker.invoke(cmd).then(function() {
                expect(spyEvents.pushUndoStack).toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).toHaveBeenCalled();
                done();
            });
        });

        it('"undo()" should fire a event - ' +
            ' "pushRedoStack" (when undoStack is not empty after)', function(done) {
            invoker.invoke(cmd).then(function() {
                return invoker.invoke(cmd);
            }).then(function() {
                invoker.on(spyEvents);

                return invoker.undo();
            }).then(function() {
                expect(spyEvents.pushUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
                done();
            });
        });

        it('"undo()" should fire events - ' +
            ' "pushRedoStack", "emptyUndoStack" (when undoStack is empty after)', function(done) {
            invoker.invoke(cmd).then(function() {
                invoker.on(spyEvents);

                return invoker.undo();
            }).then(function() {
                expect(spyEvents.pushUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
                done();
            });
        });

        it('"redo()" should fire a event - ' +
            ' "pushUndoStack" (when redoStack is not empty after)', function(done) {
            invoker.invoke(cmd).then(function() {
                return invoker.invoke(cmd);
            }).then(function() {
                return invoker.undo();
            }).then(function() {
                return invoker.undo();
            }).then(function() {
                invoker.on(spyEvents);

                return invoker.redo();
            }).then(function() {
                expect(spyEvents.pushUndoStack).toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
                done();
            });
        });

        it('"redo()" should fire events - ' +
            ' "pushUndoStack", "emptyRedoStack" (when undoStack is empty after)', function(done) {
            invoker.invoke(cmd).then(function() {
                return invoker.undo();
            }).then(function() {
                invoker.on(spyEvents);

                return invoker.redo(cmd);
            }).then(function() {
                expect(spyEvents.pushUndoStack).toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).toHaveBeenCalled();
                done();
            });
        });
    });
});
