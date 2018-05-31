import './js/polyfill';
import ImageEditor from './js/imageEditor';
import './css/index.styl';

// commands
import './js/command/addIcon';
import './js/command/addImageObject';
import './js/command/addObject';
import './js/command/addShape';
import './js/command/addText';
import './js/command/applyFilter';
import './js/command/changeIconColor';
import './js/command/changeShape';
import './js/command/changeText';
import './js/command/changeTextStyle';
import './js/command/clearObjects';
import './js/command/flip';
import './js/command/loadImage';
import './js/command/removeFilter';
import './js/command/removeObject';
import './js/command/resizeCanvasDimension';
import './js/command/rotate';
import './js/command/setObjectProperties';
import './js/command/setObjectPosition';

module.exports = ImageEditor;
