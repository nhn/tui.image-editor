/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Set object properties
 */
import commandFactory from '../factory/command';
// import {Promise} from '../util';
// import {commandNames, rejectMessages} from '../consts';

const command = {
    name: 'moveResizeFromSelection',

    execute(graphics, id, props) {
        /*
        const targetObj = graphics.getObject(id);

        this.undoData.props = {};
        snippet.forEachOwnProperties(props, (value, key) => {
            this.undoData.props[key] = targetObj[key];
        });

        graphics.setObjectProperties(id, props);

        return Promise.resolve();
        */
    },
    undo(graphics, id) {
        /*
        const {props} = this.undoData;

        console.log('Undo', props);

        graphics.setObjectProperties(id, props);

        return Promise.resolve();
        */
    }
};

commandFactory.register(command);

export default command;
