import {extend} from 'tui-code-snippet';
import {isSupportFileApi, base64ToBlob, toInteger} from './util';
import Imagetracer from './helper/imagetracer';

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
        const exitCropOnAction = () => {
            if (this.ui.submenu === 'crop') {
                this.stopDrawingMode();
                this.ui.changeMenu('crop');
            }
        };
        const setAngleRangeBarOnAction = angle => {
            if (this.ui.submenu === 'rotate') {
                this.ui.rotate.setRangeBarAngle('setAngle', angle);
            }
        };
        const setFilterStateRangeBarOnAction = filterOptions => {
            if (this.ui.submenu === 'filter') {
                this.ui.filter.setFilterState(filterOptions);
            }
        };
        const onEndUndoRedo = result => {
            setAngleRangeBarOnAction(result);
            setFilterStateRangeBarOnAction(result);

            return result;
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
                    this.deactivateAll();
                    this.undo().then(onEndUndoRedo);
                }
            },
            redo: () => {
                if (!this.isEmptyRedoStack()) {
                    exitCropOnAction();
                    this.deactivateAll();
                    this.redo().then(onEndUndoRedo);
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
                this.ui.changeHelpButtonEnabled('delete', false);
                exitCropOnAction();
                this.removeActiveObject();
                this.activeObjectId = null;
            },
            deleteAll: () => {
                exitCropOnAction();
                this.clearObjects();
                this.ui.changeHelpButtonEnabled('delete', false);
                this.ui.changeHelpButtonEnabled('deleteAll', false);
            },
            load: file => {
                if (!isSupportFileApi()) {
                    alert('This browser does not support file-api');
                }

                this.ui.initializeImgUrl = URL.createObjectURL(file);
                this.loadImageFromFile(file).then(sizeValue => {
                    exitCropOnAction();
                    this.clearUndoStack();
                    this.ui.activeMenuEvent();
                    this.ui.resizeEditor({imageSize: sizeValue});
                })['catch'](message => (
                    Promise.reject(message)
                ));
            },
            download: () => {
                const dataURL = this.toDataURL();
                let imageName = this.getImageName();
                let blob, type, w;

                if (isSupportFileApi() && window.saveAs) {
                    blob = base64ToBlob(dataURL);
                    type = blob.type.split('/')[1];
                    if (imageName.split('.').pop() !== type) {
                        imageName += `.${type}`;
                    }
                    saveAs(blob, imageName); // eslint-disable-line
                } else {
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
        let cacheIconType;
        let cacheIconColor;
        let startX;
        let startY;
        let iconWidth;
        let iconHeight;
        let objId;

        this.on({
            'iconCreateResize': ({moveOriginPointer}) => {
                const scaleX = (moveOriginPointer.x - startX) / iconWidth;
                const scaleY = (moveOriginPointer.y - startY) / iconHeight;

                this.setObjectPropertiesQuietly(objId, {
                    scaleX: Math.abs(scaleX * 2),
                    scaleY: Math.abs(scaleY * 2)
                });
            },
            'iconCreateEnd': () => {
                this.ui.icon.clearIconType();
                this.changeSelectableAll(true);
            }
        });

        const mouseDown = (e, originPointer) => {
            startX = originPointer.x;
            startY = originPointer.y;

            this.addIcon(cacheIconType, {
                left: originPointer.x,
                top: originPointer.y,
                fill: cacheIconColor
            }).then(obj => {
                objId = obj.id;
                iconWidth = obj.width;
                iconHeight = obj.height;
            });
        };

        return extend({
            changeColor: color => {
                if (this.activeObjectId) {
                    this.changeIconColor(this.activeObjectId, color);
                }
            },
            addIcon: (iconType, iconColor) => {
                cacheIconType = iconType;
                cacheIconColor = iconColor;
                // this.readyAddIcon();
                this.changeCursor('crosshair');
                this.off('mousedown');
                this.once('mousedown', mouseDown.bind(this));
            },
            cancelAddIcon: () => {
                this.off('mousedown');
                this.ui.icon.clearIconType();
                this.changeSelectableAll(true);
                this.changeCursor('default');
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
            changeTextStyle: (styleObj, isSilent) => {
                if (this.activeObjectId) {
                    this.changeTextStyle(this.activeObjectId, styleObj, isSilent);
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
            rotate: (angle, isSilent) => {
                this.rotate(angle, isSilent);
                this.ui.resizeEditor();
                this.ui.rotate.setRangeBarAngle('rotate', angle);
            },
            setAngle: (angle, isSilent) => {
                this.setAngle(angle, isSilent);
                this.ui.resizeEditor();
                this.ui.rotate.setRangeBarAngle('setAngle', angle);
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
            changeShape: (changeShapeObject, isSilent) => {
                if (this.activeObjectId) {
                    this.changeShape(this.activeObjectId, changeShapeObject, isSilent);
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
            },
            /* eslint-disable */
            preset: presetType => {
                switch (presetType) {
                    case 'preset-square':
                        this.setCropzoneRect(1 / 1);
                        break;
                    case 'preset-3-2':
                        this.setCropzoneRect(3 / 2);
                        break;
                    case 'preset-4-3':
                        this.setCropzoneRect(4 / 3);
                        break;
                    case 'preset-5-4':
                        this.setCropzoneRect(5 / 4);
                        break;
                    case 'preset-7-5':
                        this.setCropzoneRect(7 / 5);
                        break;
                    case 'preset-16-9':
                        this.setCropzoneRect(16 / 9);
                        break;
                    default:
                        this.setCropzoneRect();
                        this.ui.crop.changeApplyButtonStatus(false);
                        break;
                }
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
            applyFilter: (applying, type, options, isSilent) => {

                if (applying) {
                    this.applyFilter(type, options, isSilent);
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
                    this.ui.changeHelpButtonEnabled('undo', true);
                    this.ui.changeHelpButtonEnabled('reset', true);
                } else {
                    this.ui.changeHelpButtonEnabled('undo', false);
                    this.ui.changeHelpButtonEnabled('reset', false);
                }
                this.ui.resizeEditor();
            },
            redoStackChanged: length => {
                if (length) {
                    this.ui.changeHelpButtonEnabled('redo', true);
                } else {
                    this.ui.changeHelpButtonEnabled('redo', false);
                }
                this.ui.resizeEditor();
            },
            /* eslint-disable complexity */
            objectActivated: obj => {
                this.activeObjectId = obj.id;

                this.ui.changeHelpButtonEnabled('delete', true);
                this.ui.changeHelpButtonEnabled('deleteAll', true);

                if (obj.type === 'cropzone') {
                    this.ui.crop.changeApplyButtonStatus(true);
                } else if (['rect', 'circle', 'triangle'].indexOf(obj.type) > -1) {
                    this.stopDrawingMode();
                    if (this.ui.submenu !== 'shape') {
                        this.ui.changeMenu('shape', false, false);
                    }
                    this.ui.shape.setShapeStatus({
                        strokeColor: obj.stroke,
                        strokeWidth: obj.strokeWidth,
                        fillColor: obj.fill
                    });

                    this.ui.shape.setMaxStrokeValue(Math.min(obj.width, obj.height));
                } else if (obj.type === 'path' || obj.type === 'line') {
                    if (this.ui.submenu !== 'draw') {
                        this.ui.changeMenu('draw', false, false);
                        this.ui.draw.changeStandbyMode();
                    }
                } else if (['i-text', 'text'].indexOf(obj.type) > -1) {
                    if (this.ui.submenu !== 'text') {
                        this.ui.changeMenu('text', false, false);
                    }

                    this.ui.text.setTextStyleStateOnAction(obj);
                } else if (obj.type === 'icon') {
                    this.stopDrawingMode();
                    if (this.ui.submenu !== 'icon') {
                        this.ui.changeMenu('icon', false, false);
                    }
                    this.ui.icon.setIconPickerColor(obj.fill);
                }
            },
            /* eslint-enable complexity */
            addText: pos => {
                const {
                    textColor: fill,
                    fontSize,
                    fontStyle,
                    fontWeight,
                    underline
                } = this.ui.text;
                const fontFamily = 'Noto Sans';

                this.addText('Double Click', {
                    position: pos.originPosition,
                    styles: {fill, fontSize, fontFamily, fontStyle, fontWeight, underline}
                }).then(() => {
                    this.changeCursor('default');
                });
            },
            addObjectAfter: obj => {
                if (['rect', 'circle', 'triangle'].indexOf(obj.type) > -1) {
                    this.ui.shape.setMaxStrokeValue(Math.min(obj.width, obj.height));
                    this.ui.shape.changeStandbyMode();
                }
            },
            objectScaled: obj => {
                if (['i-text', 'text'].indexOf(obj.type) > -1) {
                    this.ui.text.fontSize = toInteger(obj.fontSize);
                } else if (['rect', 'circle', 'triangle'].indexOf(obj.type) >= 0) {
                    const {width, height} = obj;
                    const strokeValue = this.ui.shape.getStrokeValue();

                    if (width < strokeValue) {
                        this.ui.shape.setStrokeValue(width);
                    }
                    if (height < strokeValue) {
                        this.ui.shape.setStrokeValue(height);
                    }
                }
            },
            selectionCleared: () => {
                this.activeObjectId = null;
                if (this.ui.submenu === 'text') {
                    this.changeCursor('text');
                } else if (this.ui.submenu !== 'draw' && this.ui.submenu !== 'crop') {
                    this.stopDrawingMode();
                }
            }
        });
    },

    /**
     * Common Action
     * @returns {Object} common actions for ui
     * @private
     */
    _commonAction() {
        return {
            modeChange: menu => {
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
                    default:
                        break;
                }
            },
            deactivateAll: this.deactivateAll.bind(this),
            changeSelectableAll: this.changeSelectableAll.bind(this),
            discardSelection: this.discardSelection.bind(this),
            stopDrawingMode: this.stopDrawingMode.bind(this)
        };
    },

    /**
     * Mixin
     * @param {ImageEditor} ImageEditor instance
     */
    mixin(ImageEditor) {
        extend(ImageEditor.prototype, this);
    }
};
