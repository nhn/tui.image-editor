/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Command factory
 */
import Promise from 'core-js/library/es6/promise';
import Command from '../interface/command';
import consts from '../consts';

const {componentNames, commandNames, rejectMessages} = consts;
const {MAIN, IMAGE_LOADER, FLIP, ROTATION, FILTER, ICON, SHAPE, TEXT} = componentNames;
const creators = {};

creators[commandNames.LOAD_IMAGE] = createLoadImageCommand;
creators[commandNames.FLIP_IMAGE] = createFlipImageCommand;
creators[commandNames.ROTATE_IMAGE] = createRotationImageCommand;
creators[commandNames.CLEAR_OBJECTS] = createClearCommand;
creators[commandNames.ADD_OBJECT] = createAddObjectCommand;
creators[commandNames.REMOVE_OBJECT] = createRemoveCommand;
creators[commandNames.APPLY_FILTER] = createFilterCommand;
creators[commandNames.REMOVE_FILTER] = createRemoveFilterCommand;
creators[commandNames.ADD_ICON] = createAddIconCommand;
creators[commandNames.CHANGE_ICON_COLOR] = createChangeIconColorCommand;
creators[commandNames.ADD_SHAPE] = createAddShapeCommand;
creators[commandNames.CHANGE_SHAPE] = createChangeShapeCommand;
creators[commandNames.ADD_TEXT] = createAddTextCommand;
creators[commandNames.CHANGE_TEXT] = createChangeTextCommand;
creators[commandNames.CHANGE_TEXT_STYLE] = createChangeTextStyleCommand;
creators[commandNames.ADD_IMAGE_OBJECT] = createAddImageObjectCommand;
creators[commandNames.RESIZE_CANVAS_DIMENSION] = createResizeCanvasDimensionCommand;

/**
 * @param {fabric.Object} object - Fabric object
 * @returns {Command}
 * @ignore
 */
function createAddObjectCommand(object) {
    tui.util.stamp(object);

    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            return new Promise((resolve, reject) => {
                const canvas = compMap[MAIN].getCanvas();

                if (!canvas.contains(object)) {
                    canvas.add(object);
                    canvas.setActiveObject(object);
                    resolve(object);
                } else {
                    reject();
                }
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            return new Promise((resolve, reject) => {
                const canvas = compMap[MAIN].getCanvas();

                if (canvas.contains(object)) {
                    canvas.remove(object);
                    resolve(object);
                } else {
                    reject();
                }
            });
        }
    });
}

/**
 * @param {string} imageName - Image name
 * @param {string|fabric.Image} img - Image(or url)
 * @returns {Command}
 * @ignore
 */
function createLoadImageCommand(imageName, img) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const loader = compMap[IMAGE_LOADER];
            const canvas = loader.getCanvas();

            this.store = {
                prevName: loader.getImageName(),
                prevImage: loader.getCanvasImage(),
                // Slice: "canvas.clear()" clears the objects array, So shallow copy the array
                objects: canvas.getObjects().slice()
            };
            canvas.clear();

            return loader.load(imageName, img);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const loader = compMap[IMAGE_LOADER];
            const canvas = loader.getCanvas();
            const store = this.store;
            const canvasContext = canvas;

            canvas.clear();
            canvas.add.apply(canvasContext, store.objects);

            return loader.load(store.prevName, store.prevImage);
        }
    });
}

/**
 * @param {string} type - 'flipX' or 'flipY' or 'reset'
 * @returns {$.Deferred}
 * @ignore
 */
function createFlipImageCommand(type) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const flipComp = compMap[FLIP];

            this.store = flipComp.getCurrentSetting();

            return flipComp[type]();
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const flipComp = compMap[FLIP];

            return flipComp.set(this.store);
        }
    });
}

/**
 * @param {string} type - 'rotate' or 'setAngle'
 * @param {number} angle - angle value (degree)
 * @returns {$.Deferred}
 * @ignore
 */
function createRotationImageCommand(type, angle) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const rotationComp = compMap[ROTATION];

            this.store = rotationComp.getCurrentAngle();

            return rotationComp[type](angle);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const rotationComp = compMap[ROTATION];

            return rotationComp.setAngle(this.store);
        }
    });
}

/**
 * Clear command
 * @returns {Command}
 * @ignore
 */
function createClearCommand() {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            return new Promise((resolve, reject) => {
                const canvas = compMap[MAIN].getCanvas();
                const objs = canvas.getObjects();

                // Slice: "canvas.clear()" clears the objects array, So shallow copy the array
                this.store = objs.slice();
                if (this.store.length) {
                    tui.util.forEach(objs.slice(), obj => {
                        obj.remove();
                    });
                    resolve();
                } else {
                    reject();
                }
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const canvas = compMap[MAIN].getCanvas();
            const canvasContext = canvas;

            canvas.add.apply(canvasContext, this.store);

            return Promise.resolve();
        }
    });
}

/**
 * Remove command
 * @param {fabric.Object|fabric.Group} target - Object(s) to remove
 * @returns {Command}
 * @ignore
 */
function createRemoveCommand(target) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            return new Promise((resolve, reject) => {
                const canvas = compMap[MAIN].getCanvas();
                const isValidGroup = target && target.isType('group') && !target.isEmpty();

                if (isValidGroup) {
                    canvas.discardActiveGroup(); // restore states for each objects
                    this.store = target.getObjects();
                    target.forEachObject(obj => {
                        obj.remove();
                    });
                    resolve();
                } else if (canvas.contains(target)) {
                    this.store = [target];
                    target.remove();
                    resolve();
                } else {
                    reject();
                }
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const canvas = compMap[MAIN].getCanvas();
            const canvasContext = canvas;

            canvas.add.apply(canvasContext, this.store);

            return Promise.resolve();
        }
    });
}

/**
 * Filter command
 * @param {string} type - Filter type
 * @param {object} options - Filter options
 * @returns {Command}
 * @ignore
 */
function createFilterCommand(type, options) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const filterComp = compMap[FILTER];

            if (type === 'mask') {
                this.store = options.mask;
                options.mask.remove();
            } else {
                this.store = filterComp.getOptions(type);
            }

            return filterComp.add(type, options);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const filterComp = compMap[FILTER];

            if (type === 'mask') {
                filterComp.getCanvas().add(this.store); // this.store is mask image

                return filterComp.remove(type);
            }

            // options changed case
            if (this.store) {
                return filterComp.add(type, this.store);  // this.store is options object
            }

            // filter added case
            return filterComp.remove(type);  // this.store is options object
        }
    });
}

/**
 * Filter command
 * @param {string} type - Filter type
 * @returns {Command}
 * @ignore
 */
function createRemoveFilterCommand(type) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const filterComp = compMap[FILTER];

            this.store = filterComp.getOptions(type);

            return filterComp.remove(type);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const filterComp = compMap[FILTER];

            return filterComp.add(type, this.store);
        }
    });
}

/**
 * Adding icon Command
 * @param {string} type - Icon type ('arrow', 'cancel', custom icon name)
 * @param {object} options - Icon options
 *      @param {string} [options.fill] - Icon foreground color
 *      @param {string} [options.left] - Icon x position
 *      @param {string} [options.top] - Icon y position
 * @returns {Command}
 * @ignore
 */
function createAddIconCommand(type, options) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const iconComp = compMap[ICON];
            const self = this;

            return iconComp.add(type, options).then(icon => {
                self.store = icon;
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo() {
            this.store.remove();

            return Promise.resolve();
        }
    });
}

/**
 * Changing icon color Command
 * @param {string} color - Color for icon
 * @returns {Command}
 * @ignore
 */
function createChangeIconColorCommand(color) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            return new Promise((resolve, reject) => {
                const iconComp = compMap[ICON];
                const canvas = iconComp.getCanvas();
                const activeObj = canvas.getActiveObject();

                if (!activeObj) {
                    reject(rejectMessages.noActiveObject);
                }

                this.storeObj = activeObj;
                this.store = iconComp.getColor(activeObj);
                iconComp.setColor(color, activeObj);
                resolve();
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const iconComp = compMap[ICON];

            iconComp.setColor(this.store, this.storeObj);

            return Promise.resolve();
        }
    });
}

/**
 * Adding shape Command
 * @param {string} type - Shape type (ex: 'rect', 'circle', 'triangle')
 * @param {object} options - Shape options
 *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
 *      @param {string} [options.stroke] - Shape outline color
 *      @param {number} [options.strokeWidth] - Shape outline width
 *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
 *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
 *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
 *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
 *      @param {number} [options.left] - Shape x position
 *      @param {number} [options.top] - Shape y position
 *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
 * @returns {Command}
 * @ignore
 */
function createAddShapeCommand(type, options) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const shapeComp = compMap[SHAPE];
            const self = this;

            return shapeComp.add(type, options).then(shape => {
                self.store = shape;
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo() {
            this.store.remove();

            return Promise.resolve();
        }
    });
}

/**
 * Changing shape Command
 * @param {object} options - Shape options
 *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
 *      @param {string} [options.stroke] - Shape outline color
 *      @param {number} [options.strokeWidth] - Shape outline width
 *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
 *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
 *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
 *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
 *      @param {number} [options.left] - Shape x position
 *      @param {number} [options.top] - Shape y position
 *      @param {number} [options.isRegular] - Whether resizing shape has 1:1 ratio or not
 * @returns {Command}
 * @ignore
 */
function createChangeShapeCommand(options) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const shapeComp = compMap[SHAPE];
            const canvas = shapeComp.getCanvas();
            const activeObj = canvas.getActiveObject();

            if (!activeObj) {
                return Promise.reject(rejectMessages.noActiveObject);
            }

            this.storeObj = activeObj;
            this.store = {};
            tui.util.forEachOwnProperties(options, (value, key) => {
                this.store[key] = activeObj[key];
            });

            return shapeComp.change(activeObj, options);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const shapeComp = compMap[SHAPE];

            return shapeComp.change(this.storeObj, this.store);
        }
    });
}

/**
 * Adding text Command
 * @param {string} text - Initial input text
 * @param {object} [options] Options for generating text
 *     @param {object} [options.styles] Initial styles
 *         @param {string} [options.styles.fill] Color
 *         @param {string} [options.styles.fontFamily] Font type for text
 *         @param {number} [options.styles.fontSize] Size
 *         @param {string} [options.styles.fontStyle] Type of inclination (normal / italic)
 *         @param {string} [options.styles.fontWeight] Type of thicker or thinner looking (normal / bold)
 *         @param {string} [options.styles.textAlign] Type of text align (left / center / right)
 *         @param {string} [options.styles.textDecoraiton] Type of line (underline / line-throgh / overline)
 *     @param {{x: number, y: number}} [options.position] - Initial position
 * @returns {Command}
 * @ignore
 */
function createAddTextCommand(text, options) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const textComp = compMap[TEXT];
            const self = this;

            return textComp.add(text, options).then(textObj => {
                self.store = textObj;
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo() {
            this.store.remove();

            return Promise.resolve();
        }
    });
}

/**
 * Command which is changing contents of selected text object
 * @param {string} text - Changing text
 * @returns {Command}
 * @ignore
 */
function createChangeTextCommand(text) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const textComp = compMap[TEXT];
            const canvas = textComp.getCanvas();
            const activeObj = canvas.getActiveObject();

            if (!activeObj) {
                return Promise.reject(rejectMessages.noActiveObject);
            }

            this.storeObj = activeObj;
            this.store = textComp.getText(activeObj);

            return textComp.change(activeObj, text);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const textComp = compMap[TEXT];

            return textComp.change(this.storeObj, this.store);
        }
    });
}

/**
 * Change text style command
 * @param {object} styleObj - text styles
 *     @param {string} [styleObj.fill] Color
 *     @param {string} [styleObj.fontFamily] Font type for text
 *     @param {number} [styleObj.fontSize] Size
 *     @param {string} [styleObj.fontStyle] Type of inclination (normal / italic)
 *     @param {string} [styleObj.fontWeight] Type of thicker or thinner looking (normal / bold)
 *     @param {string} [styleObj.textAlign] Type of text align (left / center / right)
 *     @param {string} [styleObj.textDecoraiton] Type of line (underline / line-throgh / overline)
 * @returns {Command}
 * @ignore
 */
function createChangeTextStyleCommand(styleObj) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const textComp = compMap[TEXT];
            const canvas = textComp.getCanvas();
            const activeObj = canvas.getActiveObject();

            if (!activeObj) {
                return Promise.reject(rejectMessages.noActiveObject);
            }

            this.storeObj = activeObj;
            this.store = {};
            tui.util.forEachOwnProperties(styleObj, (value, key) => {
                this.store[key] = activeObj[key];
            });

            return textComp.setStyle(activeObj, styleObj);
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const textComp = compMap[TEXT];

            return textComp.setStyle(this.storeObj, this.store);
        }
    });
}

/**
 * Command which is adding image object on canvas
 * @param {string} imgUrl - Image url to make object
 * @returns {Command}
 * @ignore
 */
function createAddImageObjectCommand(imgUrl) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            const mainComp = compMap[MAIN];
            const self = this;

            return mainComp.addImageObject(imgUrl).then(imgObj => {
                self.store = imgObj;
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo() {
            this.store.remove();

            return Promise.resolve();
        }
    });
}

/**
 * Command which is resizing canvas dimension
 * @param {{width: number, height: number}} dimension - Max width & height
 * @returns {Command}
 * @ignore
 */
function createResizeCanvasDimensionCommand(dimension) {
    return new Command({
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        execute(compMap) {
            return new Promise(resolve => {
                const mainComp = compMap[MAIN];

                this.store = {
                    width: mainComp.cssMaxWidth,
                    height: mainComp.cssMaxHeight
                };

                mainComp.setCssMaxDimension(dimension);
                mainComp.adjustCanvasDimension();
                resolve();
            });
        },
        /**
         * @param {object.<string, Component>} compMap - Components injection
         * @returns {Promise}
         * @ignore
         */
        undo(compMap) {
            const mainComp = compMap[MAIN];

            mainComp.setCssMaxDimension(this.store);
            mainComp.adjustCanvasDimension();

            return Promise.resolve();
        }
    });
}

/**
 * Create command
 * @param {string} name - Command name
 * @param {...*} args - Arguments for creating command
 * @returns {Command}
 * @ignore
 */
function create(name, ...args) {
    return creators[name].apply(null, args);
}


module.exports = {
    create
};
