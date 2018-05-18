import Imagetracer from '../plugin/imagetracer';
export default class Action {
    constructor(imageEditor) {
        this._editorEventHandler(imageEditor);

        return {
            shape: this.shapeAction(imageEditor),
            crop: this.cropAction(imageEditor),
            flip: this.flipAction(imageEditor),
            rotate: this.rotateAction(imageEditor),
            text: this.textAction(imageEditor),
            mask: this.maskAction(imageEditor),
            draw: this.drawAction(imageEditor),
            icon: this.iconAction(imageEditor)
        };
    }

    iconAction(imageEditor) {
        return {
            changeColor: color => {
                imageEditor.changeIconColor(imageEditor.activeObjectId, color);
            },
            addIcon: iconType => {
                imageEditor.once('mousedown', (e, originPointer) => {
                    imageEditor.addIcon(iconType, {
                        left: originPointer.x,
                        top: originPointer.y
                    }).then(objectProps => {
                        console.log(objectProps);
                    });
                });
            },
            registDefalutIcons: (type, path) => {
                const iconObj = {};
                iconObj[type] = path;
                imageEditor.registerIcons(iconObj);
            },
            registCustomIcon: (imgUrl, file) => {
                const imagetracer = new Imagetracer();
                imagetracer.imageToSVG(
                    imgUrl,
                    svgstr => {
                        const [, svgPath] = svgstr.match(/path[^>]*d="([^"]*)"/);
                        const iconObj = {};
                        iconObj[file.name] = svgPath;
                        imageEditor.registerIcons(iconObj);
                        imageEditor.addIcon(file.name, {
                            left: 100,
                            top: 100
                        }).then(objectProps => {
                            console.log(objectProps);
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
    }

    drawAction(imageEditor) {
        return {
            setDrawMode: (type, settings) => {
                imageEditor.stopDrawingMode();
                if (type === 'free') {
                    imageEditor.startDrawingMode('FREE_DRAWING', settings);
                } else {
                    imageEditor.startDrawingMode('LINE_DRAWING', settings);
                }
            },
            setColor: color => {
                imageEditor.setBrush({
                    color
                });
            }
        };
    }

    maskAction(imageEditor) {
        return {
            loadImageFromURL: (imgUrl, file) => {
                imageEditor.loadImageFromURL(imageEditor.toDataURL(), 'FilterImage').then(() => {
                    imageEditor.addImageObject(imgUrl).then(objectProps => {
                        URL.revokeObjectURL(file);
                        console.log(objectProps);
                    });
                });
            },
            applyFilter: () => {
                imageEditor.applyFilter('mask', {
                    maskObjId: imageEditor.activeObjectId
                }).then(result => {
                    console.log(result);
                });
            }
        };
    }

    textAction(imageEditor) {
        return {
            changeTextStyle: styleObj => {
                if (imageEditor.activeObjectId) {
                    imageEditor.changeTextStyle(imageEditor.activeObjectId, styleObj);
                }
            }
        };
    }

    rotateAction(imageEditor) {
        return {
            rotate: angle => {
                imageEditor.rotate(angle);
                imageEditor.ui.resizeEditor();
            },
            setAngle: angle => {
                imageEditor.setAngle(angle);
                imageEditor.ui.resizeEditor();
            }
        };
    }

    shapeAction(imageEditor) {
        return {
            changeShape: changeShapeObject => {
                if (imageEditor.activeObjectId) {
                    imageEditor.changeShape(imageEditor.activeObjectId, changeShapeObject);
                }
            },
            setDrawingShape: shapeType => {
                imageEditor.setDrawingShape(shapeType);
            }
        };
    }

    cropAction(imageEditor) {
        return {
            crop: () => {
                imageEditor.crop(imageEditor.getCropzoneRect()).then(() => {
                    imageEditor.stopDrawingMode();
                    imageEditor.ui.resizeEditor();
                    imageEditor.ui.changeMenu('crop');
                });
            },
            cancel: () => {
                imageEditor.stopDrawingMode();
                imageEditor.ui.changeMenu('crop');
            }
        };
    }

    flipAction(imageEditor) {
        return {
            flip: flipType => {
                imageEditor[flipType]().then(status => {
                    console.log(status);
                });
            }
        };
    }

    _editorEventHandler(imageEditor) {
        imageEditor.on({
            undoStackChanged: length => {
                if (length) {
                    // $btnUndo.removeClass('disabled');
                } else {
                    // $btnUndo.addClass('disabled');
                }
                imageEditor.ui.resizeEditor();
            },
            objectActivated: obj => {
                imageEditor.activeObjectId = obj.id;

                if (obj.type === 'cropzone') {
                    imageEditor.ui.crop._btnElement.apply.classList.add('active');
                } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle') {
                    imageEditor._changeActivateMode('SHAPE');
                    const strokeColor = obj.stroke;
                    const {strokeWidth} = obj;
                    const fillColor = obj.fill;
                    imageEditor.ui.shape._btnElement.strokeRange.setValue(strokeWidth);
                    imageEditor.ui.shape._btnElement.strokeColorpicker.setColor(strokeColor);
                    imageEditor.ui.shape._btnElement.fillColorpicker.setColor(fillColor);
                    imageEditor.ui.shape.options.stroke = strokeColor;
                    imageEditor.ui.shape.options.fill = fillColor;
                    imageEditor.ui.shape.options.strokeWidth = strokeWidth;
                } else if (obj.type === 'text') {
                    imageEditor._changeActivateMode('TEXT');
                }
            },
            addText: pos => {
                imageEditor.addText('Double Click', {
                    position: pos.originPosition
                }).then(objectProps => {
                    console.log(objectProps);
                });
            },
            mousedown: (event, originPointer) => {
                if (imageEditor.ui.submenu && imageEditor.hasFilter('colorFilter')) {
                    imageEditor.applyFilter('colorFilter', {
                        x: parseInt(originPointer.x, 10),
                        y: parseInt(originPointer.y, 10)
                    });
                }
            }
        });
    }
}
