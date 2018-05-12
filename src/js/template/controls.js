export default `
            <div class="tui-image-editor-controls">
                <div class="logo">
                    <img src="img/icon/img-bi.svg" />
                </div>
                <ul class="">
                    <li id="btn-undo">
                        <svg class="svg_ic-undo">
                            <use xlink:href="../dist/icon-a.svg#ic-undo" class="normal" />
                            <use xlink:href="../dist/icon-b.svg#ic-undo" class="active" />
                            <use xlink:href="../dist/icon-a.svg#ic-undo" class="disable" />
                        </svg>
                    </li>
                    <li id="btn-redo">
                        <svg class="svg_ic-redo">
                            <use xlink:href="../dist/icon-a.svg#ic-redo" class="normal" />
                            <use xlink:href="../dist/icon-b.svg#ic-redo" class="active" />
                            <use xlink:href="../dist/icon-a.svg#ic-redo" class="disable" />
                        </svg>
                    </li>
                    <li id="btn-reset">
                        <svg class="svg_ic-reset">
                            <use xlink:href="../dist/icon-a.svg#ic-reset" class="normal" />
                            <use xlink:href="../dist/icon-b.svg#ic-reset" class="active" />
                            <use xlink:href="../dist/icon-a.svg#ic-reset" class="disable" />
                        </svg>
                    </li>
                    <li>
                        <div class="ic-partition"></div>
                    </li>
                    <li id="btn-delete">
                        <svg class="svg_ic-delete">
                            <use xlink:href="../dist/icon-a.svg#ic-delete" class="normal"/>
                            <use xlink:href="../dist/icon-b.svg#ic-delete" class="active"/>
                            <use xlink:href="../dist/icon-a.svg#ic-delete" class="disable" />
                        </svg>
                    </li>
                    <li id="btn-delete-all">
                        <svg class="svg_ic-delete-all">
                            <use xlink:href="../dist/icon-a.svg#ic-delete-all" class="normal"/>
                            <use xlink:href="../dist/icon-b.svg#ic-delete-all" class="active"/>
                            <use xlink:href="../dist/icon-a.svg#ic-delete-all" class="disable" />
                        </svg>
                    </li>
                    <li>
                        <div class="ic-partition"></div>
                    </li>
                    <li id="btn-crop">
                        <svg class="svg_ic-crop">
                            <use xlink:href="../dist/icon-a.svg#ic-crop" class="normal"/>
                            <use xlink:href="../dist/icon-b.svg#ic-crop" class="active"/>
                            <use xlink:href="../dist/icon-a.svg#ic-crop" class="disable" />
                        </svg>
                    </li>
                    <li id="btn-flip">
                        <svg class="svg_ic-flip">
                            <use xlink:href="../dist/icon-a.svg#ic-flip" class="normal"/>
                            <use xlink:href="../dist/icon-b.svg#ic-flip" class="active"/>
                            <use xlink:href="../dist/icon-a.svg#ic-flip" class="disable" />
                        </svg>
                    </li>
                    <li id="btn-rotate">
                        <svg class="svg_ic-rotate">
                            <use xlink:href="../dist/icon-a.svg#ic-rotate" class="normal"/>
                            <use xlink:href="../dist/icon-b.svg#ic-rotate" class="active"/>
                            <use xlink:href="../dist/icon-a.svg#ic-rotate" class="disable" />
                        </svg>
                    </li>
                    <li id="btn-draw">
                        <svg class="svg_ic-draw">
                            <use xlink:href="../dist/icon-a.svg#ic-draw" class="normal"/>
                            <use xlink:href="../dist/icon-b.svg#ic-draw" class="active"/>
                            <use xlink:href="../dist/icon-a.svg#ic-draw" class="disable" />
                        </svg>
                    </li>
                    <li id="btn-shape">
                        <svg class="svg_ic-shape">
                            <use xlink:href="../dist/icon-a.svg#ic-shape" class="normal"/>
                            <use xlink:href="../dist/icon-b.svg#ic-shape" class="active"/>
                            <use xlink:href="../dist/icon-a.svg#ic-shape" class="disable" />
                        </svg>
                    </li>
                    <li id="btn-icon">
                        <svg class="svg_ic-icon">
                            <use xlink:href="../dist/icon-a.svg#ic-icon" class="normal"/>
                            <use xlink:href="../dist/icon-b.svg#ic-icon" class="active"/>
                            <use xlink:href="../dist/icon-a.svg#ic-icon" class="disable" />
                        </svg>
                    </li>
                    <li id="btn-text">
                        <svg class="svg_ic-text">
                            <use xlink:href="../dist/icon-a.svg#ic-text" class="normal"/>
                            <use xlink:href="../dist/icon-b.svg#ic-text" class="active"/>
                            <use xlink:href="../dist/icon-a.svg#ic-text" class="disable" />
                        </svg>
                    </li>
                    <li id="btn-mask">
                        <svg class="svg_ic-mask">
                            <use xlink:href="../dist/icon-a.svg#ic-mask" class="normal"/>
                            <use xlink:href="../dist/icon-b.svg#ic-mask" class="active"/>
                            <use xlink:href="../dist/icon-a.svg#ic-mask" class="disable" />
                        </svg>
                    </li>
                    <li>
                        <i class="image-editor-icon ic-filter"></i>
                    </li>
                </ul>

                <div class="buttons">
                    <button>Load</button>
                    <button class="download">Download</button>
                </div>
            </div>
`;
/*
  svg use {
  display: none;
  }
  svg .normal {
  display: block;
  }
  .active svg .active {
  display: block;
  }
  .hover svg .disable {
  display: block;
  }
  .active svg .normal,
  .hover svg .normal {
  display: none;
  }
*/
