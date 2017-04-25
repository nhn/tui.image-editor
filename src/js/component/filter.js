/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Add filter module
 */
import Promise from 'core-js/library/es6/promise';
import Component from '../interface/component';
import Mask from '../extension/mask';
import consts from '../consts';
import Blur from '../extension/blur';
import Sharpen from '../extension/sharpen';
import Emboss from '../extension/emboss';
import ColorFilter from '../extension/colorFilter';

const {isUndefined, extend, forEach, defineNamespace} = tui.util;
defineNamespace('fabric.Image.filters.Mask', Mask, true);
defineNamespace('fabric.Image.filters.Blur', Blur, true);
defineNamespace('fabric.Image.filters.Sharpen', Sharpen, true);
defineNamespace('fabric.Image.filters.Emboss', Emboss, true);
defineNamespace('fabric.Image.filters.ColorFilter', ColorFilter, true);

/**
 * Filter
 * @class Filter
 * @param {Component} parent - parent component
 * @extends {Component}
 * @ignore
 */
class Filter extends Component {
    constructor(parent) {
        super();
        this.setParent(parent);

        /**
         * Component name
         * @type {string}
         */
        this.name = consts.componentNames.FILTER;
    }

    /**
     * Add filter to source image (a specific filter is added on fabric.js)
     * @param {string} type - Filter type
     * @param {object} [options] - Options of filter
     * @returns {Promise}
     */
    add(type, options) {
        return new Promise((resolve, reject) => {
            const sourceImg = this._getSourceImage();
            const canvas = this.getCanvas();
            let filter = this._getFilter(sourceImg, type);
            if (!filter) {
                filter = this._createFilter(sourceImg, type, options);
            }

            if (!filter) {
                reject();
            }

            this._changeFilterValues(filter, options);

            this._apply(sourceImg, () => {
                canvas.renderAll();
                resolve({
                    type,
                    action: 'add'
                });
            });
        });
    }

    /**
     * Remove filter to source image
     * @param {string} type - Filter type
     * @returns {Promise}
     */
    remove(type) {
        return new Promise((resolve, reject) => {
            const sourceImg = this._getSourceImage();
            const canvas = this.getCanvas();

            if (!sourceImg.filters.length) {
                reject();
            }

            this._removeFilter(sourceImg, type);

            this._apply(sourceImg, () => {
                canvas.renderAll();
                resolve({
                    type,
                    action: 'remove'
                });
            });
        });
    }

    /**
     * Whether this has the filter or not
     * @param {string} type - Filter type
     * @returns {boolean} true if it has the filter
     */
    hasFilter(type) {
        return !!this._getFilter(this._getSourceImage(), type);
    }

    /**
     * Get a filter options
     * @param {string} type - Filter type
     * @returns {Object} filter options or null if there is no that filter
     */
    getOptions(type) {
        const sourceImg = this._getSourceImage();
        const filter = this._getFilter(sourceImg, type);
        if (!filter) {
            return null;
        }

        return extend({}, filter.options);
    }

    /**
     * Change filter values
     * @param {object} filter object of filter
     * @param {object} options object
     * @private
     */
    _changeFilterValues(filter, options) {
        forEach(options, (value, key) => {
            if (!isUndefined(filter[key])) {
                filter[key] = value;
            }
        });
        forEach(filter.options, (value, key) => {
            if (!isUndefined(options[key])) {
                filter.options[key] = options[key];
            }
        });
    }

    /**
     * Apply filter
     * @param {fabric.Image} sourceImg - Source image to apply filter
     * @param {function} callback - Executed function after applying filter
     * @private
     */
    _apply(sourceImg, callback) {
        sourceImg.applyFilters(callback);
    }

    /**
     * Get source image on canvas
     * @returns {fabric.Image} Current source image on canvas
     * @private
     */
    _getSourceImage() {
        return this.getCanvasImage();
    }

    /**
     * Create filter instance
     * @param {fabric.Image} sourceImg - Source image to apply filter
     * @param {string} type - Filter type
     * @param {object} [options] - Options of filter
     * @returns {object} Fabric object of filter
     * @private
     */
    _createFilter(sourceImg, type, options) {
        let filterObj;
        // capitalize first letter for matching with fabric image filter name
        const fabricType = this._getFabricFilterType(type);
        const ImageFilter = fabric.Image.filters[fabricType];
        if (ImageFilter) {
            filterObj = new ImageFilter(options);
            filterObj.options = options;
            sourceImg.filters.push(filterObj);
        }

        return filterObj;
    }

    /**
     * Get applied filter instance
     * @param {fabric.Image} sourceImg - Source image to apply filter
     * @param {string} type - Filter type
     * @returns {object} Fabric object of filter
     * @private
     */
    _getFilter(sourceImg, type) {
        let filter = null,
            item, i, length;
        const fabricType = this._getFabricFilterType(type);
        if (sourceImg) {
            length = sourceImg.filters.length;
            for (i = 0; i < length; i += 1) {
                item = sourceImg.filters[i];
                if (item.type === fabricType) {
                    filter = item;
                    break;
                }
            }
        }

        return filter;
    }

    /**
     * Remove applied filter instance
     * @param {fabric.Image} sourceImg - Source image to apply filter
     * @param {string} type - Filter type
     * @private
     */
    _removeFilter(sourceImg, type) {
        const fabricType = this._getFabricFilterType(type);
        sourceImg.filters = tui.util.filter(sourceImg.filters, value => value.type !== fabricType);
    }

    /**
     * Change filter class name to fabric's, especially capitalizing first letter
     * @param {string} type - Filter type
     * @example
     * 'grayscale' -> 'Grayscale'
     * @returns {string} Fabric filter class name
     */
    _getFabricFilterType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
}

module.exports = Filter;
