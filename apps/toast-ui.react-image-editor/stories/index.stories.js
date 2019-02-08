import React from 'react';
import {storiesOf} from '@storybook/react';
import {actions} from '@storybook/addon-actions';

import 'tui-image-editor/dist/tui-image-editor.css';

import ImageEditor from '../src/index';

const stories = storiesOf('Toast UI ImageEditor', module);

stories.add('Include default UI', () => (
  <ImageEditor
    includeUI={{
      loadImage: {
        path: 'img/sampleImage2.png',
        name: 'sampleImage'
      }
    }}
  />
));

stories.add('Using Method', () => {
  class Story extends React.Component {
    ref = React.createRef();

    ImageEditor = null;

    componentDidMount() {
      this.ImageEditor = this.ref.current.getInstance();
    }

    handleClickAppend = () => {
      this.ImageEditor.appendRow({}, {at: 0});
    };

    handleClickSort = () => {
      this.ImageEditor.sort('type');
    };

    handleClickUnSort = () => {
      this.ImageEditor.unSort();
    };

    render() {
      return <ImageEditor ref={this.ref} />;
    }
  }

  return <Story />;
});

stories.add('Events', () => {
  const eventsFromObject = actions('onClick', 'onDblclick', 'onMousedown');

  return <ImageEditor {...eventsFromObject} />;
});
