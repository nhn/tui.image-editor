import snippet from 'tui-code-snippet';
import util from '../util';
import Imagetracer from '../plugin/imagetracer';

export default {
    mixin(ImageEditor) {
        snippet.extend(ImageEditor.prototype, this);
    },

    getActions() {
        return {
            main: this.mainAction(),
            shape: this.shapeAction(),
            crop: this.cropAction(),
            flip: this.flipAction(),
            rotate: this.rotateAction(),
            text: this.textAction(),
            mask: this.maskAction(),
            draw: this.drawAction(),
            icon: this.iconAction(),
            filter: this.filterAction()
        };
    },

    filterAction() {
        return {
            applyFilter: (applying, type, options) => {
                if (applying) {
                    this.applyFilter(type, options);
                } else {
                    this.removeFilter(type);
                }
            }
        };
    },

    mainAction() {
        return {
            initLoadImage: (imagePath, imageName, callback) => {
                this.loadImageFromURL(imagePath, imageName).then(sizeValue => {
                    this.ui.resizeEditor(sizeValue);
                    this.clearUndoStack();
                    callback();
                });
            },
            undo: () => {
                if (!this.isEmptyUndoStack()) {
                    this.undo();
                }
            },
            redo: () => {
                if (!this.isEmptyRedoStack()) {
                    this.redo();
                }
            },
            reset: () => {
                const undoRecursiveCall = () => {
                    if (this.isEmptyUndoStack()) {
                        this.clearUndoStack();
                        this.clearRedoStack();
                    } else {
                        this.undo().then(() => {
                            undoRecursiveCall();
                        });
                    }
                };
                undoRecursiveCall();
                this.ui.resizeEditor();
            },
            delete: () => {
                this.ui._btnElement['delete'].classList.remove('enabled');
                if (!this.activeObjectId) {
                    this.removeObject(this.activeObjectId);
                }
            },
            deleteAll: () => {
                this.clearObjects();
                this.ui._btnElement['delete'].classList.remove('enabled');
                this.ui._btnElement.deleteAll.classList.remove('enabled');
            },
            load: file => {
                const supportingFileAPI = !!(window.File && window.FileList && window.FileReader);

                if (!supportingFileAPI) {
                    alert('This browser does not support file-api');
                }

                this.loadImageFromFile(file).then(() => {
                    this.clearUndoStack();
                    this.ui.resizeEditor();
                });
            },
            download: () => {
                const supportingFileAPI = !!(window.File && window.FileList && window.FileReader);
                const dataURL = this.toDataURL();
                let imageName = this.getImageName();
                let blob, type, w;

                if (supportingFileAPI) {
                    blob = util.base64ToBlob(dataURL);
                    type = blob.type.split('/')[1];
                    if (imageName.split('.').pop() !== type) {
                        imageName += `.${type}`;
                    }
                    saveAs(blob, imageName); // eslint-disable-line
                } else {
                    alert('This browser needs a file-server');
                    w = window.open();
                    w.document.body.innerHTML = `<img src='${dataURL}'>`;
                }
            },
            modeChange: menu => {
                switch (menu) {
                    case 'text':
                        this._changeActivateMode('TEXT');
                        break;
                    case 'crop':
                        this.startDrawingMode('CROPPER');
                        break;
                    case 'shape':
                        this.setDrawingShape(this.ui.shape.type, this.ui.shape.options);
                        this.stopDrawingMode();
                        this._changeActivateMode('SHAPE');
                        break;
                    case 'draw':
                        this.ui.draw.setDrawMode();
                        break;
                    default:
                        this.stopDrawingMode();
                        break;
                }
            }
        };
    },

    iconAction() {
        return {
            changeColor: color => {
                this.changeIconColor(this.activeObjectId, color);
            },
            addIcon: iconType => {
                this.once('mousedown', (e, originPointer) => {
                    this.addIcon(iconType, {
                        left: originPointer.x,
                        top: originPointer.y
                    });
                    this.ui.icon.clearIconType();
                });
            },
            registDefalutIcons: (type, path) => {
                const iconObj = {};
                iconObj[type] = path;
                this.registerIcons(iconObj);
            },
            registCustomIcon: (imgUrl, file) => {
                const imagetracer = new Imagetracer();
                imagetracer.imageToSVG(
                    imgUrl,
                    svgstr => {
                        const [, svgPath] = svgstr.match(/path[^>]*d="([^"]*)"/);
                        const iconObj = {};
                        iconObj[file.name] = svgPath;
                        this.registerIcons(iconObj);
                        this.addIcon(file.name, {
                            left: 100,
                            top: 100
                        });
                    },
                    {
                        pathomit: 100,
                        ltres: 0.1,
                        qtres: 1,
                        scale: 1,
                        strokewidth: 5,
                        viewbox: false,
                        linefilter: true,
                        desc: false,
                        rightangleenhance: false,
                        pal: [{
                            r: 0,
                            g: 0,
                            b: 0,
                            a: 255
                        }, {
                            r: 255,
                            g: 255,
                            b: 255,
                            a: 255
                        }]
                    }
                );
            }
        };
    },

    drawAction() {
        return {
            setDrawMode: (type, settings) => {
                this.stopDrawingMode();
                if (type === 'free') {
                    this.startDrawingMode('FREE_DRAWING', settings);
                } else {
                    this.startDrawingMode('LINE_DRAWING', settings);
                }
            },
            setColor: color => {
                this.setBrush({
                    color
                });
            }
        };
    },

    maskAction() {
        return {
            loadImageFromURL: (imgUrl, file) => {
                this.loadImageFromURL(this.toDataURL(), 'FilterImage').then(() => {
                    this.addImageObject(imgUrl).then(() => {
                        URL.revokeObjectURL(file);
                    });
                });
            },
            applyFilter: () => {
                this.applyFilter('mask', {
                    maskObjId: this.activeObjectId
                });
            }
        };
    },

    textAction() {
        return {
            changeTextStyle: styleObj => {
                if (this.activeObjectId) {
                    this.changeTextStyle(this.activeObjectId, styleObj);
                }
            }
        };
    },

    rotateAction() {
        return {
            rotate: angle => {
                this.rotate(angle);
                this.ui.resizeEditor();
            },
            setAngle: angle => {
                this.setAngle(angle);
                this.ui.resizeEditor();
            }
        };
    },

    shapeAction() {
        return {
            changeShape: changeShapeObject => {
                if (this.activeObjectId) {
                    this.changeShape(this.activeObjectId, changeShapeObject);
                }
            },
            setDrawingShape: shapeType => {
                this.setDrawingShape(shapeType);
            }
        };
    },

    cropAction() {
        return {
            crop: () => {
                const cropRect = this.getCropzoneRect();
                if (cropRect) {
                    this.crop(cropRect).then(() => {
                        this.stopDrawingMode();
                        this.ui.resizeEditor();
                        this.ui.changeMenu('crop');
                    });
                }
            },
            cancel: () => {
                this.stopDrawingMode();
                this.ui.changeMenu('crop');
            }
        };
    },

    flipAction() {
        return {
            flip: flipType => {
                if (!this.ui.flip.flipStatus && flipType === 'resetFlip') {
                    return;
                }

                this[flipType]().then(flipStatus => {
                    const flipClassList = this.ui.flip._el.flipButton.classList;
                    this.ui.flip.flipStatus = false;
                    flipClassList.remove('resetFlip');
                    snippet.forEach(['flipX', 'flipY'], type => {
                        flipClassList.remove(type);
                        if (flipStatus[type]) {
                            flipClassList.add(type);
                            flipClassList.add('resetFlip');
                            this.ui.flip.flipStatus = true;
                        }
                    });
                });
            }
        };
    },

    setReAction() {
        this.on({
            undoStackChanged: length => {
                if (length) {
                    this.ui._btnElement.undo.classList.add('enabled');
                    this.ui._btnElement.reset.classList.add('enabled');
                } else {
                    this.ui._btnElement.undo.classList.remove('enabled');
                    this.ui._btnElement.reset.classList.remove('enabled');
                }
                this.ui.resizeEditor();
            },
            redoStackChanged: length => {
                if (length) {
                    this.ui._btnElement.redo.classList.add('enabled');
                } else {
                    this.ui._btnElement.redo.classList.remove('enabled');
                }
                this.ui.resizeEditor();
            },
            objectActivated: obj => {
                this.activeObjectId = obj.id;

                this.ui._btnElement['delete'].classList.add('enabled');
                this.ui._btnElement.deleteAll.classList.add('enabled');

                if (obj.type === 'cropzone') {
                    this.ui.crop._el.apply.classList.add('active');
                } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle') {
                    this._changeActivateMode('SHAPE');
                    const strokeColor = obj.stroke;
                    const {strokeWidth} = obj;
                    const fillColor = obj.fill;
                    this.ui.shape._el.strokeRange.setValue(strokeWidth);
                    this.ui.shape._el.strokeColorpicker.setColor(strokeColor);
                    this.ui.shape._el.fillColorpicker.setColor(fillColor);
                    this.ui.shape.options.stroke = strokeColor;
                    this.ui.shape.options.fill = fillColor;
                    this.ui.shape.options.strokeWidth = strokeWidth;
                } else if (obj.type === 'text') {
                    this._changeActivateMode('TEXT');
                }
            },
            addText: pos => {
                this.addText('Double Click', {
                    position: pos.originPosition
                }).then(() => {
                    this.changeTextStyle(this.activeObjectId, {
                        fill: this.ui.text.getTextColor(),
                        fontSize: parseInt(this.ui.text.getFontSize(), 10)
                    });
                });
            },
            objectScaled: obj => {
                if (obj.type === 'text') {
                    this.ui.text.setFontSize(parseInt(obj.fontSize, 10));
                }
            },
            mousedown: (event, originPointer) => {
                if (this.ui.submenu && this.hasFilter('colorFilter')) {
                    this.applyFilter('colorFilter', {
                        x: parseInt(originPointer.x, 10),
                        y: parseInt(originPointer.y, 10)
                    });
                }
            }
        });
    }
};
