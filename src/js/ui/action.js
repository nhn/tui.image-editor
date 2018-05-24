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
                    this.undo().then();
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
                this.ui.changeDeleteButtonEnabled(false);
                if (this.activeObjectId) {
                    this.removeObject(this.activeObjectId);
                    this.activeObjectId = null;
                }
            },
            deleteAll: () => {
                this.clearObjects();
                this.ui.changeDeleteButtonEnabled(false);
                this.ui.changeDeleteAllButtonEnabled(false);
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
            flip: flipType => this[flipType]()
        };
    },

    setReAction() {
        this.on({
            undoStackChanged: length => {
                if (length) {
                    this.ui._el.undo.classList.add('enabled');
                    this.ui._el.reset.classList.add('enabled');
                } else {
                    this.ui._el.undo.classList.remove('enabled');
                    this.ui._el.reset.classList.remove('enabled');
                }
                this.ui.resizeEditor();
            },
            redoStackChanged: length => {
                if (length) {
                    this.ui._el.redo.classList.add('enabled');
                } else {
                    this.ui._el.redo.classList.remove('enabled');
                }
                this.ui.resizeEditor();
            },
            objectActivated: obj => {
                this.activeObjectId = obj.id;

                this.ui._el['delete'].classList.add('enabled');
                this.ui._el.deleteAll.classList.add('enabled');

                if (obj.type === 'cropzone') {
                    this.ui.crop._el.apply.classList.add('active');
                } else if (['rect', 'circle', 'triangle'].indexOf(obj.type) > -1) {
                    this._changeActivateMode('SHAPE');
                    this.ui.shape.setShapeStatus({
                        strokeColor: obj.stroke,
                        strokeWidth: obj.strokeWidth,
                        fillColor: obj.fill
                    });
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
