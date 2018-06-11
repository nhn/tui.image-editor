import {extend} from 'tui-code-snippet';
import util from './util';
import Imagetracer from './helper/imagetracer';
import resizeHelper from './helper/shapeResizeHelper';

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

    _commonAction() {
        return {
            changeSelectableAll: selectable => {
                this.changeSelectableAll(selectable);
            },
            discardSelection: () => {
                this.stopDrawingMode();
                this.discardSelection();
            },
            modeChange: menu => {
                this.stopDrawingMode();
                switch (menu) {
                    case 'text':
                        this._changeActivateMode('TEXT');
                        break;
                    case 'crop':
                        this.startDrawingMode('CROPPER');
                        break;
                    case 'shape':
                        this._changeActivateMode('SHAPE');
                        this.setDrawingShape(this.ui.shape.type, this.ui.shape.options);
                        break;
                    case 'draw':
                        this.ui.draw.setDrawMode();
                        break;
                    default:
                        break;
                }
            },
            stopDrawingMode: this.stopDrawingMode.bind(this)
        };
    },

    /**
     * Main Action
     * @returns {Object} actions for ui main
     * @private
     */
    _mainAction() {
        const exitCropOnAction = () => {
            if (this.ui.submenu === 'crop') {
                this.stopDrawingMode();
                this.ui.changeMenu('crop');
            }
        };

        return extend({
            initLoadImage: (imagePath, imageName) => (
                this.loadImageFromURL(imagePath, imageName).then(sizeValue => {
                    exitCropOnAction();
                    this.ui.initializeImgUrl = imagePath;
                    this.ui.resizeEditor({imageSize: sizeValue});
                    this.clearUndoStack();
                })
            ),
            undo: () => {
                if (!this.isEmptyUndoStack()) {
                    exitCropOnAction();
                    this.undo();
                }
            },
            redo: () => {
                if (!this.isEmptyRedoStack()) {
                    exitCropOnAction();
                    this.redo();
                }
            },
            reset: () => {
                exitCropOnAction();
                this.loadImageFromURL(this.ui.initializeImgUrl, 'resetImage').then(sizeValue => {
                    exitCropOnAction();
                    this.ui.resizeEditor({imageSize: sizeValue});
                    this.clearUndoStack();
                });
            },
            delete: () => {
                this.ui.changeDeleteButtonEnabled(false);
                if (this.activeObjectId) {
                    exitCropOnAction();
                    this.removeObject(this.activeObjectId);
                    this.activeObjectId = null;
                }
            },
            deleteAll: () => {
                exitCropOnAction();
                this.clearObjects();
                this.ui.changeDeleteButtonEnabled(false);
                this.ui.changeDeleteAllButtonEnabled(false);
            },
            load: file => {
                if (!util.isSupportFileApi()) {
                    alert('This browser does not support file-api');
                }

                this.ui.initializeImgUrl = URL.createObjectURL(file);
                this.loadImageFromFile(file).then(() => {
                    exitCropOnAction();
                    this.clearUndoStack();
                    this.ui.resizeEditor();
                })['catch'](message => (
                    Promise.reject(message)
                ));
            },
            download: () => {
                const dataURL = this.toDataURL();
                let imageName = this.getImageName();
                let blob, type, w;

                if (!util.isSupportFileApi()) {
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
            }
        }, this._commonAction());
    },

    /**
     * Icon Action
     * @returns {Object} actions for ui icon
     * @private
     */
    _iconAction() {
        return extend({
            changeColor: color => {
                this.changeIconColor(this.activeObjectId, color);
            },
            addIcon: iconType => {
                this.off('mousedown');
                this.once('mousedown', (e, originPointer) => {
                    this.addIcon(iconType, {
                        left: originPointer.x,
                        top: originPointer.y
                    }).then(obj => {
                        console.log('SSS', obj);
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
        }, this._commonAction());
    },

    /**
     * Draw Action
     * @returns {Object} actions for ui draw
     * @private
     */
    _drawAction() {
        return extend({
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
        }, this._commonAction());
    },

    /**
     * Mask Action
     * @returns {Object} actions for ui mask
     * @private
     */
    _maskAction() {
        return extend({
            loadImageFromURL: (imgUrl, file) => (
                this.loadImageFromURL(this.toDataURL(), 'FilterImage').then(() => {
                    this.addImageObject(imgUrl).then(() => {
                        URL.revokeObjectURL(file);
                    });
                })
            ),
            applyFilter: () => {
                this.applyFilter('mask', {
                    maskObjId: this.activeObjectId
                });
            }
        }, this._commonAction());
    },

    /**
     * Text Action
     * @returns {Object} actions for ui text
     * @private
     */
    _textAction() {
        return extend({
            changeTextStyle: styleObj => {
                if (this.activeObjectId) {
                    this.changeTextStyle(this.activeObjectId, styleObj);
                }
            }
        }, this._commonAction());
    },

    /**
     * Rotate Action
     * @returns {Object} actions for ui rotate
     * @private
     */
    _rotateAction() {
        return extend({
            rotate: angle => {
                this.rotate(angle);
                this.ui.resizeEditor();
            },
            setAngle: angle => {
                this.setAngle(angle);
                this.ui.resizeEditor();
            }
        }, this._commonAction());
    },

    /**
     * Shape Action
     * @returns {Object} actions for ui shape
     * @private
     */
    _shapeAction() {
        return extend({
            changeShape: changeShapeObject => {
                if (this.activeObjectId) {
                    this.changeShape(this.activeObjectId, changeShapeObject);
                }
            },
            setDrawingShape: shapeType => {
                this.setDrawingShape(shapeType);
            }
        }, this._commonAction());
    },

    /**
     * Crop Action
     * @returns {Object} actions for ui crop
     * @private
     */
    _cropAction() {
        return extend({
            crop: () => {
                const cropRect = this.getCropzoneRect();
                if (cropRect) {
                    this.crop(cropRect).then(() => {
                        this.stopDrawingMode();
                        this.ui.resizeEditor();
                        this.ui.changeMenu('crop');
                    })['catch'](message => (
                        Promise.reject(message)
                    ));
                }
            },
            cancel: () => {
                this.stopDrawingMode();
                this.ui.changeMenu('crop');
            }
        }, this._commonAction());
    },

    /**
     * Flip Action
     * @returns {Object} actions for ui flip
     * @private
     */
    _flipAction() {
        return extend({
            flip: flipType => this[flipType]()
        }, this._commonAction());
    },

    /**
     * Filter Action
     * @returns {Object} actions for ui filter
     * @private
     */
    _filterAction() {
        return extend({
            applyFilter: (applying, type, options) => {
                if (applying) {
                    this.applyFilter(type, options);
                } else if (this.hasFilter(type)) {
                    this.removeFilter(type);
                }
            }
        }, this._commonAction());
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
                    if (this.ui.submenu !== 'shape') {
                        this.ui.changeMenu('shape', false, false);
                    }
                    this._changeActivateMode('SHAPE');
                    this.ui.shape.setShapeStatus({
                        strokeColor: obj.stroke,
                        strokeWidth: obj.strokeWidth,
                        fillColor: obj.fill
                    });
                } else if (obj.type === 'path' || obj.type === 'line') {
                    if (this.ui.submenu) {
                        this.ui.changeMenu(this.ui.submenu, true);
                    }
                } else if (obj.type === 'text') {
                    this.ui.changeMenu('text', false);
                    this._changeActivateMode('TEXT');
                } else if (obj.type === 'icon') {
                    if (this.ui.submenu !== 'icon') {
                        this.ui.changeMenu('icon', false, false);
                    }

                    this._changeActivateMode('ICON');
                }
            },
            addText: pos => {
                this.addText('Double Click', {
                    position: pos.originPosition
                }).then(() => {
                    this.changeTextStyle(this.activeObjectId, {
                        fill: this.ui.text.textColor,
                        fontSize: util.toInteger(this.ui.text.fontSize)
                    });
                })['catch'](message => (
                    Promise.reject(message)
                ));
            },
            objectScaled: obj => {
                console.log('OBJECTSCALED');
                if (obj.type === 'text') {
                    this.ui.text.fontSize = util.toInteger(obj.fontSize);
                }
            },
            selectionCleared: () => {
                if (this.ui.submenu !== 'draw') {
                    this.stopDrawingMode();
                    this.activeObjectId = null;
                }
            }
        });
    },

    /**
     * Mixin
     * @param {ImageEditor} ImageEditor instance
     */
    mixin(ImageEditor) {
        extend(ImageEditor.prototype, this);
    }
};
