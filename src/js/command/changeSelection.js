/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview change selection
 */
import commandFactory from '../factory/command';
import {Promise} from '../util';
import {commandNames} from '../consts';

const command = {
    name: commandNames.CHANGE_SELECTION,

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
