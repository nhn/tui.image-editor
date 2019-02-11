/**
 * @fileoverview TOAST UI Image-Editor React wrapper component
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
import React from 'react';
import TuiImageEditor from 'tui-image-editor';

export default class ImageEditor extends React.Component {
  rootEl = React.createRef();

  imageEditorInst = null;

  componentDidMount() {
    this.imageEditorInst = new TuiImageEditor(this.rootEl.current, {
      ...this.props
    });

    this.bindEventHandlers();
  }

  shouldComponentUpdate() {
    return false;
  }

  getInstance() {
    return this.imageEditorInst;
  }

  getRootElement() {
    return this.rootEl.current;
  }

  bindEventHandlers() {
    Object.keys(this.props)
      .filter((key) => /on[A-Z][a-zA-Z]+/.test(key))
      .forEach((key) => {
        const eventName = key[2].toLowerCase() + key.slice(3);
        this.imageEditorInst.on(eventName, this.props[key]);
      });
  }

  render() {
    return <div ref={this.rootEl} />;
  }
}
