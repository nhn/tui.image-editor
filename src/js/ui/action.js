import snippet from 'tui-code-snippet';
import util from '../util';
import Imagetracer from '../plugin/imagetracer';

export default {

    /**
     * Get ui actions
     * @returns {Object} actions for ui
     * @private
     */
    getActions() {
        return {

            main: this._mainAction(),
            shape: this._shapeAction(),
            crop: this._cropAction(),
            flip: this._flipAction(),
            rotate: this._rotateAction(),
            text: this._textAction(),
            mask: this._maskAction(),
            draw: this._drawAction(),
            icon: this._iconAction(),
            filter: this._filterAction()
        };
    },

    /**
     * Main Action
     * @returns {Object} actions for ui main
     * @private
     */
    _mainAction() {
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

    /**
     * Icon Action
     * @returns {Object} actions for ui icon
     * @private
     */
    _iconAction() {
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
                    }, Imagetracer.tracerDefaultOption()
                );
            }
        };
    },

    /**
     * Draw Action
     * @returns {Object} actions for ui draw
     * @private
     */
    _drawAction() {
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

    /**
     * Mask Action
     * @returns {Object} actions for ui mask
     * @private
     */
    _maskAction() {
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

    /**
     * Text Action
     * @returns {Object} actions for ui text
     * @private
     */
    _textAction() {
        return {
            changeTextStyle: styleObj => {
                if (this.activeObjectId) {
                    this.changeTextStyle(this.activeObjectId, styleObj);
                }
            }
        };
    },

    /**
     * Rotate Action
     * @returns {Object} actions for ui rotate
     * @private
     */
    _rotateAction() {
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

    /**
     * Shape Action
     * @returns {Object} actions for ui shape
     * @private
     */
    _shapeAction() {
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

    /**
     * Crop Action
     * @returns {Object} actions for ui crop
     * @private
     */
    _cropAction() {
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

    /**
     * Flip Action
     * @returns {Object} actions for ui flip
     * @private
     */
    _flipAction() {
        return {
            flip: flipType => this[flipType]()
        };
    },

    /**
     * Filter Action
     * @returns {Object} actions for ui filter
     * @private
     */
    _filterAction() {
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

    /**
     * Image Editor Event Observer
     */
    setReAction() {
        this.on({
            undoStackChanged: length => {
                if (length) {
                    this.ui.changeUndoButtonStatus(true);
                    this.ui.changeResetButtonStatus(true);
                } else {
                    this.ui.changeUndoButtonStatus(false);
                    this.ui.changeResetButtonStatus(false);
                }
                this.ui.resizeEditor();
            },
            redoStackChanged: length => {
                if (length) {
                    this.ui.changeRedoButtonStatus(true);
                } else {
                    this.ui.changeRedoButtonStatus(false);
                }
                this.ui.resizeEditor();
            },
            objectActivated: obj => {
                this.activeObjectId = obj.id;

                this.ui.changeDeleteButtonEnabled(true);
                this.ui.changeDeleteAllButtonEnabled(true);

                if (obj.type === 'cropzone') {
                    this.ui.crop.changeApplyButtonStatus(true);
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
    },

    /**
     * Mixin
     * @param {ImageEditor} ImageEditor instance
     */
    mixin(ImageEditor) {
        snippet.extend(ImageEditor.prototype, this);
    }
};
