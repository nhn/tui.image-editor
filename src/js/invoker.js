/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Invoker - invoke commands
 */
import ImageLoader from './component/imageLoader';
import Cropper from './component/cropper';
import MainComponent from './component/main';
import Flip from './component/flip';
import Rotation from './component/rotation';
import FreeDrawing from './component/freeDrawing';
import Line from './component/line';
import Text from './component/text';
import Icon from './component/icon';
import Filter from './component/filter';
import Shape from './component/shape';
import consts from './consts';

const {eventNames} = consts;

/**
 * Invoker
 * @class
 * @ignore
 */
class Invoker {
    constructor() {
        /**
         * Custom Events
         * @type {tui.util.CustomEvents}
         */
        this._customEvents = new tui.util.CustomEvents();

        /**
         * Undo stack
         * @type {Array.<Command>}
         * @private
         */
        this._undoStack = [];

        /**
         * Redo stack
         * @type {Array.<Command>}
         * @private
         */
        this._redoStack = [];

        /**
         * Component map
         * @type {Object.<string, Component>}
         * @private
         */
        this._componentMap = {};

        /**
         * Lock-flag for executing command
         * @type {boolean}
         * @private
         */
        this._isLocked = false;

        this._createComponents();
    }

    /**
     * Create components
     * @private
     */
    _createComponents() {
        const main = new MainComponent();

        this._register(main);
        this._register(new ImageLoader(main));
        this._register(new Cropper(main));
        this._register(new Flip(main));
        this._register(new Rotation(main));
        this._register(new FreeDrawing(main));
        this._register(new Line(main));
        this._register(new Text(main));
        this._register(new Icon(main));
        this._register(new Filter(main));
        this._register(new Shape(main));
    }

    /**
     * Register component
     * @param {Component} component - Component handling the canvas
     * @private
     */
    _register(component) {
        this._componentMap[component.getName()] = component;
    }

    /**
     * Invoke command execution
     * @param {Command} command - Command
     * @returns {jQuery.Deferred}
     * @private
     */
    _invokeExecution(command) {
        this.lock();

        return $.when(command.execute(this._componentMap))
            .done(() => {
                this.pushUndoStack(command);
            })
            .done(command.executeCallback)
            .always(() => {
                this.unlock();
            });
    }

    /**
     * Invoke command undo
     * @param {Command} command - Command
     * @returns {jQuery.Deferred}
     * @private
     */
    _invokeUndo(command) {
        this.lock();

        return $.when(command.undo(this._componentMap))
            .done(() => {
                this.pushRedoStack(command);
            })
            .done(command.undoCallback)
            .always(() => {
                this.unlock();
            });
    }

    /**
     * Fire custom events
     * @see {@link tui.util.CustomEvents.prototype.fire}
     * @param {...*} arguments - Arguments to fire a event
     * @private
     */
    _fire(...args) {
        const event = this._customEvents;
        const eventContext = event;
        event.fire.apply(eventContext, args);
    }

    /**
     * Attach custom events
     * @see {@link tui.util.CustomEvents.prototype.on}
     * @param {...*} arguments - Arguments to attach events
     */
    on(...args) {
        const event = this._customEvents;
        const eventContext = event;
        event.on.apply(eventContext, args);
    }

    /**
     * Get component
     * @param {string} name - Component name
     * @returns {Component}
     */
    getComponent(name) {
        return this._componentMap[name];
    }

    /**
     * Lock this invoker
     */
    lock() {
        this._isLocked = true;
    }

    /**
     * Unlock this invoker
     */
    unlock() {
        this._isLocked = false;
    }

    /**
     * Invoke command
     * Store the command to the undoStack
     * Clear the redoStack
     * @param {Command} command - Command
     * @returns {jQuery.Deferred}
     */
    invoke(command) {
        if (this._isLocked) {
            return $.Deferred.reject();
        }

        return this._invokeExecution(command)
            .done(tui.util.bind(this.clearRedoStack, this));
    }

    /**
     * Undo command
     * @returns {jQuery.Deferred}
     */
    undo() {
        let command = this._undoStack.pop();
        let jqDefer;

        if (command && this._isLocked) {
            this.pushUndoStack(command, true);
            command = null;
        }
        if (command) {
            if (this.isEmptyUndoStack()) {
                this._fire(eventNames.EMPTY_UNDO_STACK);
            }
            jqDefer = this._invokeUndo(command);
        } else {
            jqDefer = $.Deferred().reject();
        }

        return jqDefer;
    }

    /**
     * Redo command
     * @returns {jQuery.Deferred}
     */
    redo() {
        let command = this._redoStack.pop();
        let jqDefer;

        if (command && this._isLocked) {
            this.pushRedoStack(command, true);
            command = null;
        }
        if (command) {
            if (this.isEmptyRedoStack()) {
                this._fire(eventNames.EMPTY_REDO_STACK);
            }
            jqDefer = this._invokeExecution(command);
        } else {
            jqDefer = $.Deferred().reject();
        }

        return jqDefer;
    }

    /**
     * Push undo stack
     * @param {Command} command - command
     * @param {boolean} [isSilent] - Fire event or not
     */
    pushUndoStack(command, isSilent) {
        this._undoStack.push(command);
        if (!isSilent) {
            this._fire(eventNames.PUSH_UNDO_STACK);
        }
    }

    /**
     * Push redo stack
     * @param {Command} command - command
     * @param {boolean} [isSilent] - Fire event or not
     */
    pushRedoStack(command, isSilent) {
        this._redoStack.push(command);
        if (!isSilent) {
            this._fire(eventNames.PUSH_REDO_STACK);
        }
    }

    /**
     * Return whether the redoStack is empty
     * @returns {boolean}
     */
    isEmptyRedoStack() {
        return this._redoStack.length === 0;
    }

    /**
     * Return whether the undoStack is empty
     * @returns {boolean}
     */
    isEmptyUndoStack() {
        return this._undoStack.length === 0;
    }

    /**
     * Clear undoStack
     */
    clearUndoStack() {
        if (!this.isEmptyUndoStack()) {
            this._undoStack = [];
            this._fire(eventNames.EMPTY_UNDO_STACK);
        }
    }

    /**
     * Clear redoStack
     */
    clearRedoStack() {
        if (!this.isEmptyRedoStack()) {
            this._redoStack = [];
            this._fire(eventNames.EMPTY_REDO_STACK);
        }
    }
}

module.exports = Invoker;
