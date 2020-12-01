/**
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Selection modify helper
 */

/**
 * Cached selection's info
 * @type {Array}
 * @private
 */
let cachedUndoDataForChangeDimension = null;

/**
 * Set cached undo data
 * @param {Array} undoData - selection object
 * @private
 */
export function setCachedUndoDataForDimension(undoData) {
    cachedUndoDataForChangeDimension = undoData;
}

/**
 * Get cached undo data
 * @returns {Object} cached undo data
 * @private
 */
export function getCachedUndoDataForDimension() {
    return cachedUndoDataForChangeDimension;
}

/**
 * Make undo data
 * @param {fabric.Object} obj - selection object
 * @param {Function} undoDatumMaker - make undo datum
 * @returns {Array} undoData
 * @private
 */
export function makeSelectionUndoData(obj, undoDatumMaker) {
    let undoData;

    if (obj.type === 'activeSelection') {
        undoData = obj.getObjects().map(item => {
            const {angle, left, top} = item;

            obj.realizeTransform(item);
            const result = undoDatumMaker(item);

            item.set({
                angle,
                left,
                top
            });

            return result;
        });
    } else {
        undoData = [undoDatumMaker(obj)];
    }

    return undoData;
}

/**
 * Make undo datum
 * @param {number} id - object id
 * @param {fabric.Object} obj - selection object
 * @returns {Object} undo datum
 * @private
 */
export function makeSelectionUndoDatum(id, obj) {
    return {
        id,
        width: obj.width,
        height: obj.height,
        top: obj.top,
        left: obj.left,
        angle: obj.angle,
        scaleX: obj.scaleX,
        scaleY: obj.scaleY
    };
}
