/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Set object properties
 */
import commandFactory from '../factory/command';
import {Promise} from '../util';
// import {commandNames, rejectMessages} from '../consts';

const command = {
    name: 'moveResizeFromSelection',

    execute(graphics, props) {
        props.forEach(prop => {
            graphics.setObjectProperties(prop.id, prop);
        });

        return Promise.resolve();
    },
    undo(graphics) {
        this.undoData.forEach(datum => {
            graphics.setObjectProperties(datum.id, datum);
        });

        return Promise.resolve();
    }
};

commandFactory.register(command);

export default command;
