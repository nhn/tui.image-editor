import React from 'react';
import {storiesOf} from '@storybook/react';

import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';

import ImageEditor from '../src/index';

const stories = storiesOf('Toast UI ImageEditor', module);

const commonContainerStyle = {height: '700px', width: '900px'};
const props = {
  includeUI: {
    loadImage: {
      path: 'img/sampleImage2.png',
      name: 'sampleImage2'
    },
    initMenu: 'shape'
  },
  cssMaxWidth: 700,
  cssMaxHeight: 500
};

stories.add('Include default UI', () => (
  <div style={commonContainerStyle}>
    <ImageEditor {...props} />
  </div>
));

stories.add('Using Method', () => {
  class Story extends React.Component {
    ref = React.createRef();

    imageEditor = null;

    componentDidMount() {
      this.imageEditor = this.ref.current.getInstance();
    }

    flipImageByAxis(isXAxis) {
      this.imageEditor[isXAxis ? 'flipX' : 'flipY']()
        .then((status) => {
          console.log('flipX: ', status.flipX);
          console.log('flipY: ', status.flipY);
          console.log('angle: ', status.angle);
        })
        ['catch']((message) => {
          console.log('error: ', message);
        });
    }

    render() {
      return (
        <div style={commonContainerStyle}>
          <ImageEditor ref={this.ref} {...props} />
          <button
            onClick={() => {
              this.flipImageByAxis(true);
            }}
          >
            Flip-X!
          </button>
          <button
            onClick={() => {
              this.flipImageByAxis(false);
            }}
          >
            Flip-Y!
          </button>
        </div>
      );
    }
  }

  return <Story />;
});

stories.add('Events', () => {
  class Story2 extends React.Component {
    ref = React.createRef();

    imageEditor = null;

    componentDidMount() {
      this.imageEditor = this.ref.current.getInstance();
    }

    render() {
      return (
        <div style={commonContainerStyle}>
          <ImageEditor
            ref={this.ref}
            {...props}
            onMousedown={(event, originPointer) => {
              console.log(event);
              console.log(originPointer);
            }}
            onAddText={(pos) => {
              const {x: ox, y: oy} = pos.originPosition;
              const {x: cx, y: cy} = pos.clientPosition;
              console.log(`text position on canvas(x, y): ${ox}px, ${oy}px`);
              console.log(`text position on brwoser(x, y): ${cx}px, ${cy}px`);
            }}
          />
        </div>
      );
    }
  }

  return <Story2 />;
});
