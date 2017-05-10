/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Main component having canvas & image, set css-max-dimension of canvas
 */
import Promise from 'core-js/library/es6/promise';
import Component from '../interface/component';
import consts from '../consts';

const {bind} = tui.util;

const DEFAULT_CSS_MAX_WIDTH = 1000;
const DEFAULT_CSS_MAX_HEIGHT = 800;

const cssOnly = {
    cssOnly: true
};
const backstoreOnly = {
    backstoreOnly: true
};

/**
 * Main component
 * @class Main
 * @extends {Component}
 * @ignore
 */
class Main extends Component {
    constructor() {
        super();

        /**
         * Component name
         * @type {string}
         */
        this.name = consts.componentNames.MAIN;

        /**
         * Fabric canvas instance
         * @type {fabric.Canvas}
         */
        this.canvas = null;

        /**
         * Fabric image instance
         * @type {fabric.Image}
         */
        this.canvasImage = null;

        /**
         * Max width of canvas elements
         * @type {number}
         */
        this.cssMaxWidth = DEFAULT_CSS_MAX_WIDTH;

        /**
         * Max height of canvas elements
         * @type {number}
         */
        this.cssMaxHeight = DEFAULT_CSS_MAX_HEIGHT;

        /**
         * Image name
         * @type {string}
         */
        this.imageName = '';
    }

    /**
     * To data url from canvas
     * @param {string} type - A DOMString indicating the image format. The default type is image/png.
     * @returns {string} A DOMString containing the requested data URI.
     */
    toDataURL(type) {
        return this.canvas && this.canvas.toDataURL(type);
    }

    /**
     * Save image(background) of canvas
     * @param {string} name - Name of image
     * @param {?fabric.Image} canvasImage - Fabric image instance
     * @override
     */
    setCanvasImage(name, canvasImage) {
        if (canvasImage) {
            tui.util.stamp(canvasImage);
        }
        this.imageName = name;
        this.canvasImage = canvasImage;
    }

    /**
     * Set css max dimension
     * @param {{width: number, height: number}} maxDimension - Max width & Max height
     */
    setCssMaxDimension(maxDimension) {
        this.cssMaxWidth = maxDimension.width || this.cssMaxWidth;
        this.cssMaxHeight = maxDimension.height || this.cssMaxHeight;
    }

    /**
     * Set canvas element to fabric.Canvas
     * @param {jQuery|Element|string} element - Wrapper or canvas element or selector
     * @override
     */
    setCanvasElement(element) {
        let selectedElement;
        let canvasElement;

        if (element.jquery) {
            selectedElement = element[0];
        } else if (element.nodeType) {
            selectedElement = element;
        } else {
            selectedElement = document.querySelector(element);
        }

        if (selectedElement.nodeName.toUpperCase() !== 'CANVAS') {
            canvasElement = document.createElement('canvas');
            selectedElement.appendChild(canvasElement);
        }

        this.canvas = new fabric.Canvas(canvasElement, {
            containerClass: 'tui-image-editor-canvas-container',
            enableRetinaScaling: false
        });
    }

    /**
     * Adjust canvas dimension with scaling image
     */
    adjustCanvasDimension() {
        const canvasImage = this.canvasImage.scale(1);
        const boundingRect = canvasImage.getBoundingRect();
        const width = boundingRect.width;
        const height = boundingRect.height;
        const maxDimension = this._calcMaxDimension(width, height);

        this.setCanvasCssDimension({
            width: '100%',
            height: '100%', // Set height '' for IE9
            'max-width': `${maxDimension.width}px`,
            'max-height': `${maxDimension.height}px`
        });

        this.setCanvasBackstoreDimension({
            width,
            height
        });
        this.canvas.centerObject(canvasImage);
    }

    /**
     * Calculate max dimension of canvas
     * The css-max dimension is dynamically decided with maintaining image ratio
     * The css-max dimension is lower than canvas dimension (attribute of canvas, not css)
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {{width: number, height: number}} - Max width & Max height
     * @private
     */
    _calcMaxDimension(width, height) {
        const wScaleFactor = this.cssMaxWidth / width;
        const hScaleFactor = this.cssMaxHeight / height;
        let cssMaxWidth = Math.min(width, this.cssMaxWidth);
        let cssMaxHeight = Math.min(height, this.cssMaxHeight);

        if (wScaleFactor < 1 && wScaleFactor < hScaleFactor) {
            cssMaxWidth = width * wScaleFactor;
            cssMaxHeight = height * wScaleFactor;
        } else if (hScaleFactor < 1 && hScaleFactor < wScaleFactor) {
            cssMaxWidth = width * hScaleFactor;
            cssMaxHeight = height * hScaleFactor;
        }

        return {
            width: Math.floor(cssMaxWidth),
            height: Math.floor(cssMaxHeight)
        };
    }

    /**
     * Set canvas dimension - css only
     *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
     * @param {object} dimension - Canvas css dimension
     * @override
     */
    setCanvasCssDimension(dimension) {
        this.canvas.setDimensions(dimension, cssOnly);
    }

    /**
     * Set canvas dimension - backstore only
     *  {@link http://fabricjs.com/docs/fabric.Canvas.html#setDimensions}
     * @param {object} dimension - Canvas backstore dimension
     * @override
     */
    setCanvasBackstoreDimension(dimension) {
        this.canvas.setDimensions(dimension, backstoreOnly);
    }

    /**
     * Set image properties
     * {@link http://fabricjs.com/docs/fabric.Image.html#set}
     * @param {object} setting - Image properties
     * @param {boolean} [withRendering] - If true, The changed image will be reflected in the canvas
     * @override
     */
    setImageProperties(setting, withRendering) {
        const canvasImage = this.canvasImage;

        if (!canvasImage) {
            return;
        }

        canvasImage.set(setting).setCoords();
        if (withRendering) {
            this.canvas.renderAll();
        }
    }

    /**
     * Returns canvas element of fabric.Canvas[[lower-canvas]]
     * @returns {HTMLCanvasElement}
     * @override
     */
    getCanvasElement() {
        return this.canvas.getElement();
    }

    /**
     * Get fabric.Canvas instance
     * @override
     * @returns {fabric.Canvas}
     */
    getCanvas() {
        return this.canvas;
    }

    /**
     * Get canvasImage (fabric.Image instance)
     * @override
     * @returns {fabric.Image}
     */
    getCanvasImage() {
        return this.canvasImage;
    }

    /**
     * Get image name
     * @override
     * @returns {string}
     */
    getImageName() {
        return this.imageName;
    }

    /**
     * Add image object on canvas
     * @param {string} imgUrl - Image url to make object
     * @returns {Promise}
     */
    addImageObject(imgUrl) {
        const callback = bind(this._callbackAfterLoadingImageObject, this);

        return new Promise(resolve => {
            fabric.Image.fromURL(imgUrl, image => {
                callback(image);
                resolve();
            }, {
                crossOrigin: 'Anonymous'
            }
            );
        });
    }

    /**
     * Callback function after loading image
     * @param {fabric.Image} obj - Fabric image object
     * @private
     */
    _callbackAfterLoadingImageObject(obj) {
        const centerPos = this.getCanvasImage().getCenterPoint();

        obj.set(consts.fObjectOptions.SELECTION_STYLE);
        obj.set({
            left: centerPos.x,
            top: centerPos.y,
            crossOrigin: 'anonymous'
        });

        this.getCanvas().add(obj).setActiveObject(obj);
    }
}

module.exports = Main;
