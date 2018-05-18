import Imagetracer from '../plugin/imagetracer';
export default class Action {
    constructor(imageEditor) {
        return {
            shape: {
                changeShape: changeShapeObject => {
                    if (imageEditor.activeObjectId) {
                        imageEditor.changeShape(imageEditor.activeObjectId, changeShapeObject);
                    }
                },
                setDrawingShape: shapeType => {
                    imageEditor.setDrawingShape(shapeType);
                }
            },
            crop: {
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
            },
            flip: {
                flip: flipType => {
                    imageEditor[flipType]().then(status => {
                        console.log(status);
                    });
                }
            },
            rotate: {
                rotate: angle => {
                    imageEditor.rotate(angle);
                    imageEditor.ui.resizeEditor();
                },
                setAngle: angle => {
                    imageEditor.setAngle(angle);
                    imageEditor.ui.resizeEditor();
                }
            },
            text: {
                changeTextStyle: styleObj => {
                    if (imageEditor.activeObjectId) {
                        imageEditor.changeTextStyle(imageEditor.activeObjectId, styleObj);
                    }
                }
            },
            mask: {
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
            },
            draw: {
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
            },
            icon: {
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
            }
        };
    }
}
