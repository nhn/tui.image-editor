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
                    imageEditor.changeTextStyle(imageEditor.activeObjectId, styleObj);
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
            }
        };
    }
}
