/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Error-message factory
 */
import util from '../util';

const keyMirror = util.keyMirror;
const types = keyMirror(
    'UN_IMPLEMENTATION',
    'NO_COMPONENT_NAME'
);
const messages = {
    UN_IMPLEMENTATION: 'Should implement a method: ',
    NO_COMPONENT_NAME: 'Should set a component name'
};
const map = {
    UN_IMPLEMENTATION(methodName) {
        return messages.UN_IMPLEMENTATION + methodName;
    },
    NO_COMPONENT_NAME() {
        return messages.NO_COMPONENT_NAME;
    }
};

module.exports = {
    types: tui.util.extend({}, types),

    create(type, ...args) {
        type = type.toLowerCase();
        const func = map[type];

        return func(...args);
    }
};
