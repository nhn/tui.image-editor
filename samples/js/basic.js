/**
 * basic.js
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview
 */
'use strict';
// Buttons
var $btns = $('.menu-item');
var $btnsActivatable = $btns.filter('.activatable');
var $btnLoadImage = $('#btn-load-image');
var $btnDownload = $('#btn-download');

var $btnUndo = $('#btn-undo');
var $btnRedo = $('#btn-redo');
var $btnClearObjects = $('#btn-clear-objects');
var $btnRemoveActiveObject = $('#btn-remove-active-object');
var $btnCrop = $('#btn-crop');
var $btnFlip = $('#btn-flip');
var $btnRotation = $('#btn-rotation');
var $btnFreeDrawing = $('#btn-free-drawing');
var $btnApplyCrop = $('#btn-apply-crop');
var $btnCancelCrop = $('#btn-cancel-crop');
var $btnFlipX = $('#btn-flip-x');
var $btnFlipY = $('#btn-flip-y');
var $btnResetFlip = $('#btn-reset-flip');
var $btnRotateClockwise = $('#btn-rotate-clockwise');
var $btnRotateCounterClockWise = $('#btn-rotate-counter-clockwise');
var $btnClose = $('.close');

// Sub menus
var $displayingSubMenu = $();
var $cropSubMenu = $('#crop-sub-menu');
var $flipSubMenu = $('#flip-sub-menu');
var $rotationSubMenu = $('#rotation-sub-menu');
var $freeDrawingSubMenu = $('#free-drawing-sub-menu');

// Image editor
var imageEditor = new tui.component.ImageEditor('.tui-image-editor canvas', {
    cssMaxWidth: 800,
    cssMaxHeight: 600
});

// Color picker
var colorpicker = tui.component.colorpicker.create({
    container: $('#tui-color-picker')[0]
});

function hexToRGBa(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    var a = alpha || 1;

    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

colorpicker.on('selectColor', function(event) {
    imageEditor.setBrush({
        color: hexToRGBa(event.color, 0.5)
    });
});

// Attach image editor custom events
imageEditor.once('loadImage', function() {
    imageEditor.clearUndoStack();
});
imageEditor.on({
    endCropping: function() {
        $cropSubMenu.hide();
    },
    endFreeDrawing: function() {
        $freeDrawingSubMenu.hide();
    },
    emptyUndoStack: function() {
        $btnUndo.addClass('disabled');
    },
    emptyRedoStack: function() {
        $btnRedo.addClass('disabled');
    },
    pushUndoStack: function() {
        $btnUndo.removeClass('disabled');
    },
    pushRedoStack: function() {
        $btnRedo.removeClass('disabled');
    }
});

// Load sample image
imageEditor.loadImageFromURL('Sample image', 'img/sampleImage.jpg');

// Attach button click event listeners
$btns.on('click', function() {
    $btnsActivatable.removeClass('active');
});

$btnsActivatable.on('click', function() {
    $(this).addClass('active');
});

$btnUndo.on('click', function() {
    $displayingSubMenu.hide();
    imageEditor.undo();
});

$btnRedo.on('click', function() {
    $displayingSubMenu.hide();
    imageEditor.redo();
});

$btnClearObjects.on('click', function() {
    $displayingSubMenu.hide();
    imageEditor.clearObjects();
});

$btnRemoveActiveObject.on('click', function() {
    $displayingSubMenu.hide();
    imageEditor.removeActiveObject();
});

$btnCrop.on('click', function() {
    imageEditor.startCropping();
    $displayingSubMenu.hide();
    $displayingSubMenu = $cropSubMenu.show();
});

$btnFlip.on('click', function() {
    imageEditor.endAll();
    $displayingSubMenu.hide();
    $displayingSubMenu = $flipSubMenu.show();
});

$btnRotation.on('click', function() {
    imageEditor.endAll();
    $displayingSubMenu.hide();
    $displayingSubMenu = $rotationSubMenu.show();
});

$btnFreeDrawing.on('click', function() {
    if (imageEditor.getCurrentState() === 'FREE_DRAWING') {
        $(this).removeClass('active');
        imageEditor.endFreeDrawing();
    } else {
        imageEditor.startFreeDrawing();
        $displayingSubMenu.hide();
        $displayingSubMenu = $freeDrawingSubMenu.show();
    }
});

$btnClose.on('click', function() {
    $displayingSubMenu.hide();
});

$btnApplyCrop.on('click', function() {
    imageEditor.endCropping(true);
});

$btnCancelCrop.on('click', function() {
    imageEditor.endCropping();
});

$btnFlipX.on('click', function() {
    imageEditor.flipX();
});

$btnFlipY.on('click', function() {
    imageEditor.flipY();
});

$btnResetFlip.on('click', function() {
    imageEditor.resetFlip();
});

$btnRotateClockwise.on('click', function() {
    imageEditor.rotate(30);
});

$btnRotateCounterClockWise.on('click', function() {
    imageEditor.rotate(-30);
});
