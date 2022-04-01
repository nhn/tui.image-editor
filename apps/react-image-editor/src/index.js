import React from 'react';
import TuiImageEditor from 'tui-image-editor';

export default class ImageEditor extends React.Component {
  rootEl = React.createRef();

  imageEditorInst = null;

  componentDidMount() {
    this.imageEditorInst = new TuiImageEditor(this.rootEl.current, {
      ...this.props,
    });

    this.bindEventHandlers(this.props);
  }

  componentWillUnmount() {
    this.unbindEventHandlers();

    this.imageEditorInst.destroy();

    this.imageEditorInst = null;
  }

  shouldComponentUpdate(nextProps) {
    this.bindEventHandlers(this.props, nextProps);

    return false;
  }

  getInstance() {
    return this.imageEditorInst;
  }

  getRootElement() {
    return this.rootEl.current;
  }

  bindEventHandlers(props, prevProps) {
    Object.keys(props)
      .filter(this.isEventHandlerKeys)
      .forEach((key) => {
        const eventName = key[2].toLowerCase() + key.slice(3);
        // For <ImageEditor onFocus={condition ? onFocus1 : onFocus2} />
        if (prevProps && prevProps[key] !== props[key]) {
          this.imageEditorInst.off(eventName);
        }
        this.imageEditorInst.on(eventName, props[key]);
      });
  }

  unbindEventHandlers() {
    Object.keys(this.props)
      .filter(this.isEventHandlerKeys)
      .forEach((key) => {
        const eventName = key[2].toLowerCase() + key.slice(3);
        this.imageEditorInst.off(eventName);
      });
  }

  isEventHandlerKeys(key) {
    return /on[A-Z][a-zA-Z]+/.test(key);
  }

  render() {
    return <div ref={this.rootEl} />;
  }
}
