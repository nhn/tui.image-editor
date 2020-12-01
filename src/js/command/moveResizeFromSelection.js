/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Set object properties
 */
import commandFactory from '../factory/command';
// import {Promise} from '../util';
// import {commandNames, rejectMessages} from '../consts';

const command = {
    name: 'moveResizeFromSelection',

    execute(graphics, propsArr) {
        // const targetObj = graphics.getObject(props.id);

        console.log('PROPSARR - ', propsArr);

        propsArr.forEach(prop => {
            graphics.setObjectProperties(prop.id, prop);
        });

        /*
        this.undoData.props = {};
        snippet.forEachOwnProperties(props, (value, key) => {
            this.undoData.props[key] = targetObj[key];
        });

        graphics.setObjectProperties(id, props);

        */

        return Promise.resolve();
    },
    undo(graphics) {
        console.log('undoDatundoDat', this.undoData);
        this.undoData.forEach(data => {
            graphics.setObjectProperties(data.id, data);
        });

        return Promise.resolve();
        /*
        graphics.setObjectProperties(id, props);
        */
    }
};

commandFactory.register(command);

export default command;
