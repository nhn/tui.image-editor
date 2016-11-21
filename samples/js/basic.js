/**
 * basic.js
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview
 */
/* eslint-disable vars-on-top */
'use strict';

var supportingFileAPI = !!(window.File && window.FileList && window.FileReader);
var rImageType = /data:(image\/.+);base64,/;
var shapeOptions = {};
var mask;

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
function getBrushSettings() {
    var brushWidth = $inputBrushWidthRange.val();
    var brushColor = brushColorpicker.getColor();

    return {
        width: brushWidth,
        color: hexToRGBa(brushColor, 0.5)
    };
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
var $btnDrawLine = $('#btn-draw-line');
var $btnDrawShape = $('#btn-draw-shape');
var $btnApplyCrop = $('#btn-apply-crop');
var $btnCancelCrop = $('#btn-cancel-crop');
var $btnFlipX = $('#btn-flip-x');
var $btnFlipY = $('#btn-flip-y');
var $btnResetFlip = $('#btn-reset-flip');
var $btnRotateClockwise = $('#btn-rotate-clockwise');
var $btnRotateCounterClockWise = $('#btn-rotate-counter-clockwise');
var $btnText = $('#btn-text');
var $btnTextStyle = $('.btn-text-style');
var $btnAddIcon = $('#btn-add-icon');
var $btnRegisterIcon = $('#btn-register-icon');
var $btnMaskFilter = $('#btn-mask-filter');
var $btnLoadMaskImage = $('#input-mask-image-file');
var $btnApplyMask = $('#btn-apply-mask');
var $btnClose = $('.close');

// Range Input
var $inputRotationRange = $('#input-rotation-range');
var $inputBrushWidthRange = $('#input-brush-width-range');
var $inputFontSizeRange = $('#input-font-size-range');
var $inputStrokeWidthRange = $('#input-stroke-width-range');

// Sub menus
var $displayingSubMenu = $();
var $cropSubMenu = $('#crop-sub-menu');
var $flipSubMenu = $('#flip-sub-menu');
var $rotationSubMenu = $('#rotation-sub-menu');
var $freeDrawingSubMenu = $('#free-drawing-sub-menu');
var $drawLineSubMenu = $('#draw-line-sub-menu');
var $drawShapeSubMenu = $('#draw-shape-sub-menu');
var $textSubMenu = $('#text-sub-menu');
var $iconSubMenu = $('#icon-sub-menu');
var $filterSubMenu = $('#filter-sub-menu');

// Select line type
var $selectLine = $('[name="select-line-type"]');

// Select shape type
var $selectShapeType = $('[name="select-shape-type"]');

// Select color of shape type
var $selectShapeColor = $('[name="select-shape-color"]');

// Image editor
var imageEditor = new tui.component.ImageEditor('.tui-image-editor canvas', {
    cssMaxWidth: 700,
    cssMaxHeight: 500
});

// Color picker for free drawing
var brushColorpicker = tui.component.colorpicker.create({
    container: $('#tui-brush-color-picker')[0],
    color: '#000000'
});

// Color picker for text palette
var textColorpicker = tui.component.colorpicker.create({
    container: $('#tui-text-color-picker')[0],
    color: '#000000'
});

// Color picker for shape
var shapeColorpicker = tui.component.colorpicker.create({
    container: $('#tui-shape-color-picker')[0],
    color: '#000000'
});

// Color picker for icon
var iconColorpicker = tui.component.colorpicker.create({
    container: $('#tui-icon-color-picker')[0],
    color: '#000000'
});

var resizeEditor = function() {
    var $editor = $('.tui-image-editor');
    var $container = $('.tui-image-editor-canvas-container');
    var height = parseFloat($container.css('max-height'));

    $editor.height(height);
};

// Attach image editor custom events
imageEditor.once('loadImage', function() {
    imageEditor.clearUndoStack();
});

imageEditor.on({
    endCropping: function() {
        $cropSubMenu.hide();
        resizeEditor();
    },
    endFreeDrawing: function() {
        $freeDrawingSubMenu.hide();
    },
    emptyUndoStack: function() {
        $btnUndo.addClass('disabled');
        resizeEditor();
    },
    emptyRedoStack: function() {
        $btnRedo.addClass('disabled');
        resizeEditor();
    },
    pushUndoStack: function() {
        $btnUndo.removeClass('disabled');
        resizeEditor();
    },
    pushRedoStack: function() {
        $btnRedo.removeClass('disabled');
        resizeEditor();
    },
    activateText: function(obj) {
        $displayingSubMenu.hide();
        $displayingSubMenu = $textSubMenu.show();

        if (obj.type === 'new') { // add new text on cavas
            imageEditor.addText('Double Click', {
                position: obj.originPosition
            });
        }
    },
    adjustObject: function(obj, type) {
        if (obj.type === 'text' && type === 'scale') {
            $inputFontSizeRange.val(obj.getFontSize());
        }
    },
    selectObject: function(obj) {
        var colorType;

        if (obj.type === 'rect' || obj.type === 'circle') {
            colorType = $selectShapeColor.val();

            if (colorType === 'stroke') {
                shapeColorpicker.setColor(obj.getStroke());
            } else if (colorType === 'fill') {
                shapeColorpicker.setColor(obj.getFill());
            }

            $inputStrokeWidthRange.val(obj.getStrokeWidth());
        }
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

$btnClose.on('click', function() {
    imageEditor.endAll();
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

$inputRotationRange.on('mousedown', function() {
    var changeAngle = function() {
        imageEditor.setAngle(parseInt($inputRotationRange.val(), 10));
    };
    $(document).on('mousemove', changeAngle);
    $(document).on('mouseup', function stopChangingAngle() {
        $(document).off('mousemove', changeAngle);
        $(document).off('mouseup', stopChangingAngle);
    });
});

$inputBrushWidthRange.on('change', function() {
    imageEditor.setBrush({width: parseInt(this.value, 10)});
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

// control draw line mode
$btnDrawLine.on('click', function() {
    imageEditor.endAll();
    $displayingSubMenu.hide();
    $displayingSubMenu = $drawLineSubMenu.show();
    $selectLine.removeAttr('checked');
});

$selectLine.on('change', function() {
    var mode = $(this).val();
    var settings = getBrushSettings();
    var state = imageEditor.getCurrentState();

    if (mode === 'freeDrawing') {
        if (state === 'FREE_DRAWING') {
            imageEditor.endFreeDrawing();
        }
        imageEditor.startFreeDrawing(settings);
    } else {
        if (state === 'LINE') {
            imageEditor.endLineDrawing();
        }
        imageEditor.startLineDrawing(settings);
    }
});

brushColorpicker.on('selectColor', function(event) {
    imageEditor.setBrush({
        color: hexToRGBa(event.color, 0.5)
    });
});

// control draw shape mode
$btnDrawShape.on('click', function() {
    var state = imageEditor.getCurrentState();
    var shapeType;

    imageEditor.endAll();
    $displayingSubMenu.hide();
    $displayingSubMenu = $drawShapeSubMenu.show();

    // set shape-drawing mode
    if (state !== 'shape') {
        // step 1. get type of shape
        shapeType = $selectShapeType.val();

        // step 2. get color of shape
        shapeOptions.stroke = '#000';
        shapeOptions.fill = '#fff';

        // step 3. get line of shape
        shapeOptions.strokeWidth = Number($inputStrokeWidthRange.val());

        // step 4-1. set state of shape
        imageEditor.setShape(shapeType, shapeOptions);

        // step 4-2. change drawing shape mode (bind mousedown event on canvas)
        imageEditor.startShapeDrawing();
    }
});

$selectShapeType.on('change', function() {
    var shapeType = $(this).val();
    imageEditor.setShape(shapeType, shapeOptions);
});

shapeColorpicker.on('selectColor', function(event) {
    var selecColorType = $selectShapeColor.val();
    var color = event.color;

    if (selecColorType === 'stroke') {
        shapeOptions.stroke = color;
    } else if (selecColorType === 'fill') {
        shapeOptions.fill = color;
    }

    imageEditor.changeShape(shapeOptions);
});

$inputStrokeWidthRange.on('change', function() {
    shapeOptions.strokeWidth = Number($(this).val());
    imageEditor.changeShape(shapeOptions);
});

// control text mode
$btnText.on('click', function() {
    if (imageEditor.getCurrentState() === 'TEXT') {
        $(this).removeClass('active');
        imageEditor.endTextMode();
    } else {
        $displayingSubMenu.hide();
        $displayingSubMenu = $textSubMenu.show();
        imageEditor.startTextMode();
    }
});

$inputFontSizeRange.on('change', function() {
    imageEditor.changeTextStyle({
        fontSize: parseInt(this.value, 10)
    });
});

$btnTextStyle.on('click', function(e) { // eslint-disable-line
    var styleType = $(this).attr('data-style-type');
    var styleObj;

    e.stopPropagation();

    switch (styleType) {
        case 'b':
            styleObj = {fontWeight: 'bold'};
            break;
        case 'i':
            styleObj = {fontStyle: 'italic'};
            break;
        case 'u':
            styleObj = {textDecoration: 'underline'};
            break;
        case 'l':
            styleObj = {textAlign: 'left'};
            break;
        case 'c':
            styleObj = {textAlign: 'center'};
            break;
        case 'r':
            styleObj = {textAlign: 'right'};
            break;
        default:
            styleObj = {};
    }

    imageEditor.changeTextStyle(styleObj);
});

textColorpicker.on('selectColor', function(event) {
    imageEditor.changeTextStyle({
        'fill': event.color
    });
});

// control icon
$btnAddIcon.on('click', function() {
    imageEditor.endAll();
    $displayingSubMenu.hide();
    $displayingSubMenu = $iconSubMenu.show();
});

$btnRegisterIcon.on('click', function() {
    $iconSubMenu.find('.menu').append(
        '<li class="menu-item icon-text" data-icon-type="customArrow">↑</li>'
    );

    imageEditor.registerIcons({
        customArrow: 'M 60 0 L 120 60 H 90 L 75 45 V 180 H 45 V 45 L 30 60 H 0 Z'
    });

    $btnRegisterIcon.off('click');
});

$iconSubMenu.on('click', '.menu-item', function() {
    var iconType = $(this).attr('data-icon-type');

    imageEditor.addIcon(iconType);
});

iconColorpicker.on('selectColor', function(event) {
    imageEditor.changeIconColor(event.color);
});

// control mask filter
$btnMaskFilter.on('click', function() {
    imageEditor.endAll();
    $displayingSubMenu.hide();


    $displayingSubMenu = $filterSubMenu.show();
});

$btnLoadMaskImage.on('change', function() {
    var file;
    var imgUrl;

    if (!supportingFileAPI) {
        alert('This browser does not support file-api');
    }

    file = event.target.files[0];

    if (file) {
        imgUrl = URL.createObjectURL(file);

        imageEditor.loadImageFromURL(imageEditor.toDataURL(), 'FilterImage');

        imageEditor.addImageObject(imgUrl);
    }
});

$btnApplyMask.on('click', function() {
    imageEditor.applyFilter('mask');
});

// Etc..

// Load sample image
imageEditor.loadImageFromURL('img/sampleImage.jpg', 'SampleImage');

// IE9 Unselectable
$('.menu').on('selectstart', function() {
    return false;
});
