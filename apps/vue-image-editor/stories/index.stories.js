import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';

import { ImageEditor } from '../src/index';

export default {
  title: 'ImageEditor',
};

const options = {
  includeUI: {
    loadImage: {
      path: 'img/sampleImage2.png',
      name: 'sampleImage2',
    },
    initMenu: 'filter',
    uiSize: {
      width: '1000px',
      height: '700px',
    },
  },
  cssMaxWidth: 700,
  cssMaxHeight: 500,
};

export const IncludeUI = () => {
  return {
    components: {
      ImageEditor,
    },
    template: '<ImageEditor :includeUi="props.includeUI" :options="{...props}">test</ImageEditor>',
    created() {
      this.props = { ...options };
    },
  };
};
