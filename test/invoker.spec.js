/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Test cases of "src/js/invoker.js"
 */
'use strict';

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

    it('should inject registered components to "command.undo"', function() {
        invoker.invoke(cmd);
        invoker.undo();

        expect(cmd.undo).toHaveBeenCalledWith(jasmine.objectContaining({
            foo: component
        }));
    });

    it('"redo()" should call "command.execute" again', function() {
        invoker.invoke(cmd);
        invoker.undo();

        cmd.execute.calls.reset();
        invoker.redo();

        expect(cmd.execute).toHaveBeenCalled();
    });

    it('should call the "command.executeCallback" after invoke', function() {
        var spyCallback = jasmine.createSpy();

        cmd.setExecuteCallback(spyCallback);
        invoker.invoke(cmd);

        expect(spyCallback).toHaveBeenCalled();
    });

    it('should call the "command.undoCallback" after undo', function() {
        var spyCallback = jasmine.createSpy();

        cmd.setUndoCallback(spyCallback);
        invoker.invoke(cmd);
        invoker.undo();

        expect(spyCallback).toHaveBeenCalled();
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
            ' "pushUndoStack" (when redoStack is empty before)"', function() {
            invoker.on(spyEvents);
            invoker.invoke(cmd);

            expect(spyEvents.pushUndoStack).toHaveBeenCalled();
            expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
            expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
            expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
        });

        it('"invoke()" should fire events - ' +
            ' "pushUndoStack", "clearRedoStack" (when redoStack is not empty before)', function(done) {
            invoker.pushRedoStack({});

            invoker.on(spyEvents);
            invoker.invoke(cmd).then(() => {
                expect(spyEvents.pushUndoStack).toHaveBeenCalled();
                expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
                expect(spyEvents.emptyRedoStack).toHaveBeenCalled();
                done();
            });
        });

        it('"undo()" should fire a event - ' +
            ' "pushRedoStack" (when undoStack is not empty after)', function() {
            invoker.invoke(cmd);
            invoker.invoke(cmd);

            invoker.on(spyEvents);
            invoker.undo();

            expect(spyEvents.pushUndoStack).not.toHaveBeenCalled();
            expect(spyEvents.pushRedoStack).toHaveBeenCalled();
            expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
            expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
        });

        it('"undo()" should fire events - ' +
            ' "pushRedoStack", "emptyUndoStack" (when undoStack is empty after)', function() {
            invoker.invoke(cmd);

            invoker.on(spyEvents);
            invoker.undo();

            expect(spyEvents.pushUndoStack).not.toHaveBeenCalled();
            expect(spyEvents.pushRedoStack).toHaveBeenCalled();
            expect(spyEvents.emptyUndoStack).toHaveBeenCalled();
            expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
        });

        it('"redo()" should fire a event - ' +
            ' "pushUndoStack" (when redoStack is not empty after)', function() {
            invoker.invoke(cmd);
            invoker.invoke(cmd);
            invoker.undo();
            invoker.undo();

            invoker.on(spyEvents);
            invoker.redo();

            expect(spyEvents.pushUndoStack).toHaveBeenCalled();
            expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
            expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
            expect(spyEvents.emptyRedoStack).not.toHaveBeenCalled();
        });

        it('"redo()" should fire events - ' +
            ' "pushUndoStack", "emptyRedoStack" (when undoStack is empty after)', function() {
            invoker.invoke(cmd);
            invoker.undo();

            invoker.on(spyEvents);
            invoker.redo(cmd);

            expect(spyEvents.pushUndoStack).toHaveBeenCalled();
            expect(spyEvents.pushRedoStack).not.toHaveBeenCalled();
            expect(spyEvents.emptyUndoStack).not.toHaveBeenCalled();
            expect(spyEvents.emptyRedoStack).toHaveBeenCalled();
        });
    });
});
