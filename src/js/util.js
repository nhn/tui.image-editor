/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Util
 */
import { forEach, sendHostname, extend, isString, pick, inArray } from 'tui-code-snippet';
import Promise from 'core-js-pure/features/promise';
import { commandNames, filterType, historyNames, SHAPE_FILL_TYPE, SHAPE_TYPE } from './consts';
const FLOATING_POINT_DIGIT = 2;
const CSS_PREFIX = 'tui-image-editor-';
const { min, max } = Math;
let hostnameSent = false;

/**
 * Export Promise Class (for simplified module path)
 * @returns {Promise} promise class
 */
export { Promise };

/**
 * Clamp value
 * @param {number} value - Value
 * @param {number} minValue - Minimum value
 * @param {number} maxValue - Maximum value
 * @returns {number} clamped value
 */
export function clamp(value, minValue, maxValue) {
  let temp;
  if (minValue > maxValue) {
    temp = minValue;
    minValue = maxValue;
    maxValue = temp;
  }

  return max(minValue, min(value, maxValue));
}

/**
 * Make key-value object from arguments
 * @returns {object.<string, string>}
 */
export function keyMirror(...args) {
  const obj = {};

  forEach(args, (key) => {
    obj[key] = key;
  });

  return obj;
}

/**
 * Make CSSText
 * @param {Object} styleObj - Style info object
 * @returns {string} Connected string of style
 */
export function makeStyleText(styleObj) {
  let styleStr = '';

  forEach(styleObj, (value, prop) => {
    styleStr += `${prop}: ${value};`;
  });

  return styleStr;
}

/**
 * Get object's properties
 * @param {Object} obj - object
 * @param {Array} keys - keys
 * @returns {Object} properties object
 */
export function getProperties(obj, keys) {
  const props = {};
  const { length } = keys;
  let i = 0;
  let key;

  for (i = 0; i < length; i += 1) {
    key = keys[i];
    props[key] = obj[key];
  }

  return props;
}

/**
 * ParseInt simpliment
 * @param {number} value - Value
 * @returns {number}
 */
export function toInteger(value) {
  return parseInt(value, 10);
}

/**
 * String to camelcase string
 * @param {string} targetString - change target
 * @returns {string}
 * @private
 */
export function toCamelCase(targetString) {
  return targetString.replace(/-([a-z])/g, ($0, $1) => $1.toUpperCase());
}

/**
 * Check browser file api support
 * @returns {boolean}
 * @private
 */
export function isSupportFileApi() {
  return !!(window.File && window.FileList && window.FileReader);
}

/**
 * hex to rgb
 * @param {string} color - hex color
 * @param {string} alpha - color alpha value
 * @returns {string} rgb expression
 */
export function getRgb(color, alpha) {
  if (color.length === 4) {
    color = `${color}${color.slice(1, 4)}`;
  }
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const a = alpha || 1;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * send hostname
 */
export function sendHostName() {
  if (hostnameSent) {
    return;
  }
  hostnameSent = true;

  sendHostname('image-editor', 'UA-129999381-1');
}

/**
 * Apply css resource
 * @param {string} styleBuffer - serialized css text
 * @param {string} tagId - style tag id
 */
export function styleLoad(styleBuffer, tagId) {
  const [head] = document.getElementsByTagName('head');
  const linkElement = document.createElement('link');
  const styleData = encodeURIComponent(styleBuffer);
  if (tagId) {
    linkElement.id = tagId;
    // linkElement.id = 'tui-image-editor-theme-style';
  }
  linkElement.setAttribute('rel', 'stylesheet');
  linkElement.setAttribute('type', 'text/css');
  linkElement.setAttribute('href', `data:text/css;charset=UTF-8,${styleData}`);
  head.appendChild(linkElement);
}

/**
 * Get selector
 * @param {HTMLElement} targetElement - target element
 * @returns {Function} selector
 */
export function getSelector(targetElement) {
  return (str) => targetElement.querySelector(str);
}

/**
 * Change base64 to blob
 * @param {String} data - base64 string data
 * @returns {Blob} Blob Data
 */
export function base64ToBlob(data) {
  const rImageType = /data:(image\/.+);base64,/;
  let mimeString = '';
  let raw, uInt8Array, i;

  raw = data.replace(rImageType, (header, imageType) => {
    mimeString = imageType;

    return '';
  });

  raw = atob(raw);
  const rawLength = raw.length;
  uInt8Array = new Uint8Array(rawLength); // eslint-disable-line

  for (i = 0; i < rawLength; i += 1) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: mimeString });
}

/**
 * Fix floating point diff.
 * @param {number} value - original value
 * @returns {number} fixed value
 */
export function fixFloatingPoint(value) {
  return Number(value.toFixed(FLOATING_POINT_DIGIT));
}

/**
 * Assignment for destroying objects.
 * @param {Object} targetObject - object to be removed.
 */
export function assignmentForDestroy(targetObject) {
  forEach(targetObject, (value, key) => {
    targetObject[key] = null;
  });
}

/**
 * Make class name for ui
 * @param {String} str  - main string of className
 * @param {String} prefix - prefix string of className
 * @returns {String} class name
 */
export function cls(str = '', prefix = '') {
  if (str.charAt(0) === '.') {
    return `.${CSS_PREFIX}${prefix}${str.slice(1)}`;
  }

  return `${CSS_PREFIX}${prefix}${str}`;
}

/**
 * Change object origin
 * @param {fabric.Object} fObject - fabric object
 * @param {Object} origin - origin of fabric object
 *   @param {string} originX - horizontal basis.
 *   @param {string} originY - vertical basis.
 */
export function changeOrigin(fObject, origin) {
  const { originX, originY } = origin;
  const { x: left, y: top } = fObject.getPointByOrigin(originX, originY);

  fObject.set({
    left,
    top,
    originX,
    originY,
  });

  fObject.setCoords();
}

/**
 * Object key value flip
 * @param {Object} targetObject - The data object of the key value.
 * @returns {Object}
 */
export function flipObject(targetObject) {
  const result = {};

  Object.keys(targetObject).forEach((key) => {
    result[targetObject[key]] = key;
  });

  return result;
}

/**
 * Set custom properties
 * @param {Object} targetObject - target object
 * @param {Object} props - custom props object
 */
export function setCustomProperty(targetObject, props) {
  targetObject.customProps = targetObject.customProps || {};
  extend(targetObject.customProps, props);
}

/**
 * Get custom property
 * @param {fabric.Object} fObject - fabric object
 * @param {Array|string} propNames - prop name array
 * @returns {object | number | string}
 */
export function getCustomProperty(fObject, propNames) {
  const resultObject = {};
  if (isString(propNames)) {
    propNames = [propNames];
  }
  forEach(propNames, (propName) => {
    resultObject[propName] = fObject.customProps[propName];
  });

  return resultObject;
}

/**
 * Capitalize string
 * @param {string} targetString - target string
 * @returns {string}
 */
export function capitalizeString(targetString) {
  return targetString.charAt(0).toUpperCase() + targetString.slice(1);
}

/**
 * Array includes check
 * @param {Array} targetArray - target array
 * @param {string|number} compareValue - compare value
 * @returns {boolean}
 */
export function includes(targetArray, compareValue) {
  return targetArray.indexOf(compareValue) >= 0;
}

/**
 * Get fill type
 * @param {Object | string} fillOption - shape fill option
 * @returns {string} 'color' or 'filter'
 */
export function getFillTypeFromOption(fillOption = {}) {
  return pick(fillOption, 'type') || SHAPE_FILL_TYPE.COLOR;
}

/**
 * Get fill type of shape type object
 * @param {fabric.Object} shapeObj - fabric object
 * @returns {string} 'transparent' or 'color' or 'filter'
 */
export function getFillTypeFromObject(shapeObj) {
  const { fill = {} } = shapeObj;
  if (fill.source) {
    return SHAPE_FILL_TYPE.FILTER;
  }

  return SHAPE_FILL_TYPE.COLOR;
}

/**
 * Check if the object is a shape object.
 * @param {fabric.Object} obj - fabric object
 * @returns {boolean}
 */
export function isShape(obj) {
  return inArray(obj.get('type'), SHAPE_TYPE) >= 0;
}

/**
 * Get object type
 * @param {string} type - fabric object type
 * @returns {string} type of object (ex: shape, icon, ...)
 */
export function getObjectType(type) {
  if (includes(SHAPE_TYPE, type)) {
    return 'shape';
  }

  switch (type) {
    case 'i-text':
      return 'text';
    case 'path':
    case 'line':
      return 'drawing';
    default:
      return type;
  }
}

/**
 * Get filter type
 * @param {string} type - fabric filter type
 * @param {object} [options] - filter type options
 *   @param {boolean} [options.useAlpha=true] - usage of alpha(true is 'color filter', false is 'remove white')
 *   @param {string} [options.mode] - mode of blendColor
 * @returns {string} type of filter (ex: sepia, blur, ...)
 */
function getFilterType(type, { useAlpha = true, mode } = {}) {
  const {
    VINTAGE,
    REMOVE_COLOR,
    BLEND_COLOR,
    SEPIA2,
    COLOR_FILTER,
    REMOVE_WHITE,
    BLEND,
  } = filterType;

  switch (type) {
    case VINTAGE:
      return SEPIA2;
    case REMOVE_COLOR:
      return useAlpha ? COLOR_FILTER : REMOVE_WHITE;
    case BLEND_COLOR:
      return mode === 'add' ? BLEND : mode;
    default:
      return type;
  }
}

/**
 * Check if command is silent command
 * @param {Command|string} command - command or command name
 * @returns {boolean}
 */
export function isSilentCommand(command) {
  const { LOAD_IMAGE, CHANGE_SELECTION, REMOVE_OBJECT } = commandNames;

  if (typeof command === 'string') {
    return includes([LOAD_IMAGE, CHANGE_SELECTION], command);
  }

  const { name } = command;

  return includes([LOAD_IMAGE, CHANGE_SELECTION, REMOVE_OBJECT], name);
}

/**
 * Get command name
 * @param {Command|string} command - command or command name
 * @returns {{name: string, ?detail: string}}
 */
// eslint-disable-next-line complexity, require-jsdoc
export function getHistoryTitle(command) {
  const {
    FLIP_IMAGE,
    ROTATE_IMAGE,
    ADD_TEXT,
    APPLY_FILTER,
    REMOVE_FILTER,
    CHANGE_SHAPE,
    CHANGE_ICON_COLOR,
    CHANGE_TEXT_STYLE,
    CLEAR_OBJECTS,
    ADD_IMAGE_OBJECT,
  } = commandNames;
  const { name, args } = command;
  let historyInfo;

  switch (name) {
    case FLIP_IMAGE:
      historyInfo = { name, detail: args[1] === 'reset' ? args[1] : args[1].slice(4) };
      break;
    case ROTATE_IMAGE:
      historyInfo = { name, detail: args[2] };
      break;
    case APPLY_FILTER:
    case REMOVE_FILTER:
      historyInfo = { name: 'Filter', detail: getFilterType(args[1], args[2]) };
      break;
    // case CHANGE_SHAPE:
    //   console.log(args);
    //   console.log('?');
    //   historyInfo = { name };
    //   break;
    // return historyNames.CHANGE_SHAPE;
    case CHANGE_ICON_COLOR:
      historyInfo = { name: 'Icon' };
      break;
    case CHANGE_TEXT_STYLE:
      historyInfo = { name: 'Text' };
      break;
    case CLEAR_OBJECTS:
      historyInfo = { name: 'Delete All' };
      break;
    case ADD_IMAGE_OBJECT:
      historyInfo = { name: 'Mask', detail: 'Add' };
      break;

    case ADD_TEXT:
    default:
      historyInfo = { name };
      break;
  }

  if (args[1] === 'mask') {
    historyInfo = { name: 'Mask', detail: 'Apply' };
  }

  return historyInfo;
}
