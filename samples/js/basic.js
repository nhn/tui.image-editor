/**
 * basic.js
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview
 */
/* eslint-disable vars-on-top */
'use strict';

var supportingFileAPI = !!(window.File && window.FileList && window.FileReader);
var rImageType = /data:(image\/.+);base64,/;
// Functions
// HEX to RGBA
function hexToRGBa(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    var a = alpha || 1;

    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}
function base64ToBlob(data) {
    var mimeString = '';
    var raw, uInt8Array, i, rawLength;

    raw = data.replace(rImageType, function(header, imageType) {
        mimeString = imageType;

        return '';
    });

    raw = atob(raw);
    rawLength = raw.length;
    uInt8Array = new Uint8Array(rawLength); // eslint-disable-line

    for (i = 0; i < rawLength; i += 1) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: mimeString});
}

// Buttons
var $btns = $('.menu-item');
var $btnsActivatable = $btns.filter('.activatable');
var $inputImage = $('#input-image-file');
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

$inputImage.on('change', function(event) {
    var file;

    if (!supportingFileAPI) {
        alert('This browser does not support file-api');
    }

    file = event.target.files[0];
    imageEditor.loadImageFromFile(file);
});

$btnDownload.on('click', function() {
    var imageName = imageEditor.getImageName();
    var dataURL = imageEditor.toDataURL();
    var blob, type, w;

    if (supportingFileAPI) {
        blob = base64ToBlob(dataURL);
        type = blob.type.split('/')[1];
        if (imageName.split('.').pop() !== type) {
            imageName += '.' + type;
        }

        // Library: FileSaver - saveAs
        saveAs(blob, imageName); // eslint-disable-line
    } else {
        alert('This browser needs a file-server');
        w = window.open();
        w.document.body.innerHTML = '<img src=' + dataURL + '>';
    }
});

// Etc..

// Load sample image
imageEditor.loadImageFromURL('img/sampleImage.jpg', 'SampleImage');

// IE9 Unselectable
$('.menu').on('selectstart', function() {
    return false;
});
