/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Constants
 */
'use strict';

var util = require('./util');

module.exports = {
    /**
     * Component names
     * @type {Object.<string, string>}
     */
    componentNames: util.keyMirror(
        'MAIN',
        'IMAGE_LOADER',
        'CROPPER',
        'FLIP',
        'ROTATION',
        'FREE_DRAWING',
        'LINE',
        'TEXT',
        'ICON',
        'FILTER',
        'SHAPE'
    ),

    /**
     * Command names
     * @type {Object.<string, string>}
     */
    commandNames: util.keyMirror(
        'CLEAR',
        'LOAD_IMAGE',
        'FLIP_IMAGE',
        'ROTATE_IMAGE',
        'ADD_OBJECT',
        'REMOVE_OBJECT',
        'APPLY_FILTER'
    ),

    /**
     * Event names
     * @type {Object.<string, string>}
     */
    eventNames: {
        LOAD_IMAGE: 'loadImage',
        CLEAR_OBJECTS: 'clearObjects',
        CLEAR_IMAGE: 'clearImage',
        START_CROPPING: 'startCropping',
        END_CROPPING: 'endCropping',
        FLIP_IMAGE: 'flipImage',
        ROTATE_IMAGE: 'rotateImage',
        ADD_OBJECT: 'addObject',
        SELECT_OBJECT: 'selectObject',
        REMOVE_OBJECT: 'removeObject',
        ADJUST_OBJECT: 'adjustObject',
        START_FREE_DRAWING: 'startFreeDrawing',
        END_FREE_DRAWING: 'endFreeDrawing',
        START_LINE_DRAWING: 'startLineDrawing',
        END_LINE_DRAWING: 'endLineDrawing',
        EMPTY_REDO_STACK: 'emptyRedoStack',
        EMPTY_UNDO_STACK: 'emptyUndoStack',
        PUSH_UNDO_STACK: 'pushUndoStack',
        PUSH_REDO_STACK: 'pushRedoStack',
        ACTIVATE_TEXT: 'activateText',
        APPLY_FILTER: 'applyFilter',
        EDIT_TEXT: 'editText',
        MOUSE_DOWN: 'mouseDown'
    },

    /**
     * Editor states
     * @type {Object.<string, string>}
     */
    states: util.keyMirror(
        'NORMAL',
        'CROP',
        'FREE_DRAWING',
        'LINE',
        'TEXT',
        'SHAPE'
    ),

    /**
     * Shortcut key values
     * @type {Object.<string, number>}
     */
    keyCodes: {
        Z: 90,
        Y: 89,
        SHIFT: 16,
        BACKSPACE: 8,
        DEL: 46
    },

    /**
     * Fabric object options
     * @type {Object.<string, Object>}
     */
    fObjectOptions: {
        SELECTION_STYLE: {
            borderColor: 'red',
            cornerColor: 'green',
            cornerSize: 10,
            originX: 'center',
            originY: 'center',
            transparentCorners: false
        }
    }
};
