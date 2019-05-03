import ImageEditor = require('tui-image-editor');

const blackTheme = {
    'common.bi.image': 'https://uicdn.toast.com/toastui/img/tui-image-editor-bi.png',
    'common.bisize.width': '251px',
    'common.bisize.height': '21px',
    'common.backgroundImage': 'none',
    'common.backgroundColor': '#1e1e1e',
    'common.border': '0px',

    // header
    'header.backgroundImage': 'none',
    'header.backgroundColor': 'transparent',
    'header.border': '0px',

    // load button
    'loadButton.backgroundColor': '#fff',
    'loadButton.border': '1px solid #ddd',
    'loadButton.color': '#222',
    'loadButton.fontFamily': 'NotoSans, sans-serif',
    'loadButton.fontSize': '12px',

    // download button
    'downloadButton.backgroundColor': '#fdba3b',
    'downloadButton.border': '1px solid #fdba3b',
    'downloadButton.color': '#fff',
    'downloadButton.fontFamily': 'NotoSans, sans-serif',
    'downloadButton.fontSize': '12px',

    // main icons
    'menu.normalIcon.path': '../dist/svg/icon-b.svg',
    'menu.normalIcon.name': 'icon-b',
    'menu.activeIcon.path': '../dist/svg/icon-a.svg',
    'menu.activeIcon.name': 'icon-a',
    'menu.iconSize.width': '24px',
    'menu.iconSize.height': '24px',

    // submenu primary color
    'submenu.backgroundColor': '#1e1e1e',
    'submenu.partition.color': '#858585',

    // submenu icons
    'submenu.normalIcon.path': '../dist/svg/icon-a.svg',
    'submenu.normalIcon.name': 'icon-a',
    'submenu.activeIcon.path': '../dist/svg/icon-c.svg',
    'submenu.activeIcon.name': 'icon-c',
    'submenu.iconSize.width': '32px',
    'submenu.iconSize.height': '32px',

    // submenu labels
    'submenu.normalLabel.color': '#858585',
    'submenu.normalLabel.fontWeight': 'lighter',
    'submenu.activeLabel.color': '#fff',
    'submenu.activeLabel.fontWeight': 'lighter',

    // checkbox style
    'checkbox.border': '1px solid #ccc',
    'checkbox.backgroundColor': '#fff',

    // rango style
    'range.pointer.color': '#fff',
    'range.bar.color': '#666',
    'range.subbar.color': '#d1d1d1',
    'range.value.color': '#fff',
    'range.value.fontWeight': 'lighter',
    'range.value.fontSize': '11px',
    'range.value.border': '1px solid #353535',
    'range.value.backgroundColor': '#151515',
    'range.title.color': '#fff',
    'range.title.fontWeight': 'lighter',

    // colorpicker style
    'colorpicker.button.border': '1px solid #1e1e1e',
    'colorpicker.title.color': '#fff'
};

const imageEditor = new ImageEditor('#container', {
    includeUI: {
        loadImage: {
            path: 'img/sampleImage.jpg',
            name: 'SampleImage'
        },
        theme: blackTheme,
        menu: ['shape', 'filter'],
        initMenu: 'filter',
        uiSize: {
            width: '1000px',
            height: '700px'
        },
        menuBarPosition: 'bottom'
    },
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});

imageEditor.addIcon('arrow');
imageEditor.addIcon('cancel', {
    left: 100,
    top: 100
}).then(objectProps => {
    console.log(objectProps.id);
});

imageEditor.addImageObject('path/fileName.jpg').then(objectProps => {
    console.log(objectProps);
});

imageEditor.addShape('rect', {
    fill: 'red',
    stroke: 'blue',
    strokeWidth: 3,
    width: 100,
    height: 200,
    left: 10,
    top: 10,
    isRegular: true
});

imageEditor.addShape('circle', {
    fill: 'red',
    stroke: 'blue',
    strokeWidth: 3,
    rx: 10,
    ry: 100,
    isRegular: false
}).then(objectProps => {
    console.log(objectProps.id);
});

imageEditor.addText('initText', {
    styles: {
        fill: '#000',
        fontSize: 20,
        fontWeight: 'bold'
    },
    position: {
        x: 10,
        y: 10
    }
}).then(objectProps => {
    console.log(objectProps.id);
});

imageEditor.applyFilter('Grayscale');
imageEditor.applyFilter('mask', {
    maskObjId: 0
}).then(obj => {
    console.log(`filterType: ${obj.type}`);
    console.log(`actType: ${obj.action}`);
});

imageEditor.changeCursor('crosshair');
imageEditor.changeIconColor(0, '#000000');
imageEditor.changeSelectableAll(false);
imageEditor.changeShape(0, {
    fill: 'red',
    stroke: 'blue',
    strokeWidth: 3,
    rx: 10,
    ry: 100
});

imageEditor.changeText(0, 'change text');
imageEditor.changeTextStyle(0, {
    fontStyle: 'italic'
});

imageEditor.clearObjects();
imageEditor.clearRedoStack();
imageEditor.clearUndoStack();

imageEditor.crop(imageEditor.getCropzoneRect());
imageEditor.deactivateAll();
imageEditor.destroy();
imageEditor.discardSelection();
imageEditor.flipX().then(status => {
    console.log(`flipX: ${status.flipX}`);
    console.log(`flipY: ${status.flipY}`);
    console.log(`angle: ${status.angle}`);
}).catch(message => {
    console.log(`error: ${message}`);
});
imageEditor.flipY();
imageEditor.getCanvasSize();
imageEditor.getCropzoneRect();
imageEditor.getDrawingMode();
imageEditor.getImageName();
imageEditor.getObjectPosition(0, 'left', 'top');
imageEditor.getObjectProperties(0, 'left');
imageEditor.getObjectProperties(0, ['left', 'top', 'width', 'height']);
imageEditor.getObjectProperties(0, {
    left: null,
    top: null,
    height: null,
    opacity: null
});

imageEditor.hasFilter('filterType');
imageEditor.isEmptyRedoStack();
imageEditor.isEmptyUndoStack();
let fileObj: any;
imageEditor.loadImageFromFile(fileObj, 'SampleImage').then(result => {
    console.log(`old: ${result.oldWidth}, ${result.oldHeight}`);
    console.log(`new: ${result.newWidth}, ${result.newHeight}`);
});
imageEditor.loadImageFromURL('http://url/testImage.png', 'lena').then(result => {
    console.log(`old: ${result.oldWidth}, ${result.oldHeight}`);
    console.log(`new: ${result.newWidth}, ${result.newHeight}`);
});
imageEditor.redo();
imageEditor.registerIcons({
    customIcon: 'M 0 0 L 20 20 L 10 10 Z',
    customArrow: 'M 60 0 L 120 60 H 90 L 75 45 V 180 H 45 V 45 L 30 60 H 0 Z'
});
imageEditor.removeActiveObject();
imageEditor.removeFilter('Grayscale').then(obj => {
    console.log(`filterType: ${obj.type}`);
    console.log(`actType: ${obj.action}`);
}).catch(message => {
    console.log(`error : ${message}`);
});
imageEditor.removeObject(0);
imageEditor.resetFlip().then(status => {
    console.log(`filpX : ${status.flipX}`);
    console.log(`flipY : ${status.flipY}`);
    console.log(`angle : ${status.angle}`);
});

imageEditor.resizeCanvasDimension({
    width: 300,
    height: 300
});
imageEditor.rotate(10);
imageEditor.setAngle(45);
imageEditor.setBrush({
    width: 12,
    color: 'rgba(0, 0, 0, 0.5)'
});
imageEditor.setBrush({
    width: 20,
    color: '#FFFFFF'
});
imageEditor.setCropzoneRect(1/1);
imageEditor.setDrawingShape('rect', {
    fill: 'red',
    width: 100,
    height: 200
});
imageEditor.setDrawingShape('circle', {
    rx: 10,
    ry: 10,
    isRegular: true
});
imageEditor.setObjectPosition(0, {
    x: 0,
    y: 0,
    originX: 'left',
    originY: 'top'
});
imageEditor.setObjectProperties(0, {
    left: 100,
    top: 100,
    width: 200,
    height: 200,
    opacity: 0.5
}).then(arg => {
    console.log(arg);
});
imageEditor.setObjectPropertiesQuietly(0, {
    left: 100,
    top: 100,
    width: 200,
    height: 200,
    opacity: 0.5
}).then(arg => {
    console.log(arg);
});
imageEditor.startDrawingMode('FREE_DRWARING', {
    width: 10,
    color: 'rgba(255, 0, 0, 0.5)'
});
imageEditor.stopDrawingMode();
imageEditor.toDataURL();
imageEditor.undo();

imageEditor.on('addText', pos => {
    imageEditor.addText('Double Click', {
        position: pos.originPosition
    });

    console.log(`text position on canvas : ${pos.originPosition}`);
    console.log(`text position on browser : ${pos.clientPosition}`);
});
imageEditor.ui.resizeEditor({uiSize: {width: '600px', height: '1200px'}});
imageEditor.ui.resizeEditor({imageSize: {newWidth: 300, newHeight: 140}});