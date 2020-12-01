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
 * @param {fabric.Object} obj - selection object
 * @private
 */
/*
export function setCachedUndoDataForChangeDimension(obj) {
    if (obj) {
        cachedUndoDataForChangeDimension = makeUndoData(obj);
    }
}
*/
export function setCachedUndoDataForChangeDimension(undoData) {
    cachedUndoDataForChangeDimension = undoData;
}

/**
 * Get cached undo data
 * @returns {Object} cached undo data
 * @private
 */
export function getCachedUndoDataForChangeDimension() {
    return cachedUndoDataForChangeDimension;
}

/**
 * Make undo data
 * @param {fabric.Object} obj - selection object
 * @returns {Array} undoData
 * @private
 */
export function makeUndoData(obj, makeUndoDataDatum) {
    let undoData;

    if (obj.type === 'activeSelection') {
        undoData = obj.getObjects().map(item => {
            const {angle, left, top} = item;

            obj.realizeTransform(item);
            const result = makeUndoDataDatum(item);

            item.set({
                angle,
                left,
                top
            });

            return result;
        });
    } else {
        undoData = [makeUndoDataDatum(obj)];
    }

    return undoData;
}

/**
 * Make undo datum
 * @param {fabric.Object} obj - selection object
 * @returns {Object} undo datum
 * @private
 */
export function makeUndoDatum(id, obj) {
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
