/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview Command factory
 */
import Command from '../interface/command';
import addIcon from '../command/addIcon';
import addImageObject from '../command/addImageObject';
import addObject from '../command/addObject';
import addShape from '../command/addShape';
import addText from '../command/addText';
import applyFilter from '../command/applyFilter';
import changeIconColor from '../command/changeIconColor';
import changeShape from '../command/changeShape';
import changeText from '../command/changeText';
import changeTextStyle from '../command/changeTextStyle';
import clearObjects from '../command/clearObjects';
import flip from '../command/flip';
import loadImage from '../command/loadImage';
import removeFilter from '../command/removeFilter';
import removeObject from '../command/removeObject';
import resizeCanvasDimension from '../command/resizeCanvasDimension';
import rotation from '../command/rotate';

const commands = {};

/**
 * Create a command
 * @param {string} name - Command name
 * @param {...*} args - Arguments for creating command
 * @returns {Command}
 * @ignore
 */
function create(name, ...args) {
    const actions = commands[name];
    if (actions) {
        return new Command(actions, args);
    }

    return null;
}

/**
 * Contains a command
 * @param {string} name - Command name
 * @returns {boolean} true if it contains, or not
 * @ignore
 */
function contains(name) {
    return commands.hasOwnProperty(name);
}

/**
 * Register a command with name as a key
 * @param {Object} command - {name:{string}, execute: {function}, undo: {function}}
 * @param {string} command.name - command name
 * @param {function} command.execute - executable function
 * @param {function} command.undo - undo function
 * @ignore
 */
function register(command) {
    commands[command.name] = command;
}

/**
 * Initialize all command
 * @private
 */
function initialize() {
    register(addIcon);
    register(addImageObject);
    register(addObject);
    register(addShape);
    register(addText);
    register(applyFilter);
    register(changeIconColor);
    register(changeShape);
    register(changeText);
    register(changeTextStyle);
    register(clearObjects);
    register(flip);
    register(loadImage);
    register(removeFilter);
    register(removeObject);
    register(resizeCanvasDimension);
    register(rotation);
}

// initialize commands here
initialize();

module.exports = {
    create,
    contains,
    register
};
