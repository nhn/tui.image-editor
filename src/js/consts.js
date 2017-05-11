/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Constants
 */
import util from './util';

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
    commandNames: {
        'CLEAR_OBJECTS': 'clearObjects',
        'LOAD_IMAGE': 'loadImage',
        'FLIP_IMAGE': 'flip',
        'ROTATE_IMAGE': 'rotate',
        'ADD_OBJECT': 'addObject',
        'REMOVE_OBJECT': 'removeObject',
        'APPLY_FILTER': 'applyFilter',
        'REMOVE_FILTER': 'removeFilter',
        'ADD_ICON': 'addIcon',
        'CHANGE_ICON_COLOR': 'changeIconColor',
        'ADD_SHAPE': 'addShape',
        'CHANGE_SHAPE': 'changeShape',
        'ADD_TEXT': 'addText',
        'CHANGE_TEXT': 'changeText',
        'CHANGE_TEXT_STYLE': 'changeTextStyle',
        'ADD_IMAGE_OBJECT': 'addImageObject',
        'RESIZE_CANVAS_DIMENSION': 'resizeCanvasDimension'
    },

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
        MOUSE_DOWN: 'mousedown'
    },

    /**
     * Editor states
     * @type {Object.<string, string>}
     */
    drawingModes: util.keyMirror(
        'NORMAL',
        'CROPPER',
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
    },

    /**
     * Promise reject messages
     * @type {Object.<string, string>}
     */
    rejectMessages: {
        flip: 'The flipX and flipY setting values are not changed.',
        rotation: 'The current angle is same the old angle.',
        loadImage: 'The background image is empty.',
        isLock: 'The executing command state is locked.',
        undo: 'The promise of undo command is reject.',
        redo: 'The promise of redo command is reject.',
        invalidDrawingMode: 'This operation is not supported in the drawing mode',
        invalidParameters: 'Invalid parameters',
        noActiveObject: 'There is no active object.',
        notSupportType: 'Not support object type'
    }
};
