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
        'REMOVE_ACTIVE_OBJECT': 'removeActiveObject',
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
        OBJECT_ADDED: 'objectAdded',
        OBJECT_ACTIVATED: 'objectActivated',
        OBJECT_MOVED: 'objectMoved',
        OBJECT_SCALED: 'objectScaled',
        TEXT_EDITING: 'textEditing',
        ADD_TEXT: 'addText',
        MOUSE_DOWN: 'mousedown',
        // UNDO/REDO Events
        REDO_STACK_CHANGED: 'redoStackChanged',
        UNDO_STACK_CHANGED: 'undoStackChanged'
    },

    /**
     * Editor states
     * @type {Object.<string, string>}
     */
    drawingModes: util.keyMirror(
        'NORMAL',
        'CROPPER',
        'FREE_DRAWING',
        'LINE_DRAWING',
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
        unsupportedType: 'Unsupported object type',
        noObject: 'The object is not in canvas.',
        addedObject: 'The object is already added.'
    }
};
