export default `
            <div class="tui-image-editor-controls">
                <div class="logo">
                    <img src="img/icon/img-bi.svg" />
                </div>
                <ul class="">
                    <li id="btn-undo">
                        <svg class="svg_ic-undo normal"> <use xlink:href="../dist/icon-a.svg#ic-undo"/> </svg>
                        <svg class="svg_ic-undo active"> <use xlink:href="../dist/icon-b.svg#ic-undo"/> </svg>
                    </li>
                    <li id="btn-redo">
                        <svg class="svg_ic-redo normal"> <use xlink:href="../dist/icon-a.svg#ic-redo"/> </svg>
                        <svg class="svg_ic-redo active"> <use xlink:href="../dist/icon-b.svg#ic-redo"/> </svg>
                    </li>
                    <li id="btn-reset">
                        <svg class="svg_ic-reset normal"> <use xlink:href="../dist/icon-a.svg#ic-reset"/> </svg>
                        <svg class="svg_ic-reset active"> <use xlink:href="../dist/icon-b.svg#ic-reset"/> </svg>
                    </li>
                    <li>
                        <div class="ic-partition"></div>
                    </li>
                    <li id="btn-delete">
                        <svg class="svg_ic-delete normal"> <use xlink:href="../dist/icon-a.svg#ic-delete"/> </svg>
                        <svg class="svg_ic-delete active"> <use xlink:href="../dist/icon-b.svg#ic-delete"/> </svg>
                    </li>
                    <li id="btn-delete-all">
                        <svg class="svg_ic-delete-all normal"> <use xlink:href="../dist/icon-a.svg#ic-delete-all"/> </svg>
                        <svg class="svg_ic-delete-all active"> <use xlink:href="../dist/icon-b.svg#ic-delete-all"/> </svg>
                    </li>
                    <li>
                        <div class="ic-partition"></div>
                    </li>
                    <li id="btn-crop">
                        <svg class="svg_ic-crop normal"> <use xlink:href="../dist/icon-a.svg#ic-crop"/> </svg>
                        <svg class="svg_ic-crop active"> <use xlink:href="../dist/icon-b.svg#ic-crop"/> </svg>
                    </li>
                    <li id="btn-flip">
                        <svg class="svg_ic-flip normal"> <use xlink:href="../dist/icon-a.svg#ic-flip"/> </svg>
                        <svg class="svg_ic-flip active"> <use xlink:href="../dist/icon-b.svg#ic-flip"/> </svg>
                    </li>
                    <li id="btn-rotate">
                        <svg class="svg_ic-rotate normal"> <use xlink:href="../dist/icon-a.svg#ic-rotate"/> </svg>
                        <svg class="svg_ic-rotate active"> <use xlink:href="../dist/icon-b.svg#ic-rotate"/> </svg>
                    </li>
                    <li id="btn-draw">
                        <svg class="svg_ic-draw normal"> <use xlink:href="../dist/icon-a.svg#ic-draw"/> </svg>
                        <svg class="svg_ic-draw active"> <use xlink:href="../dist/icon-b.svg#ic-draw"/> </svg>
                    </li>
                    <li id="btn-shape">
                        <svg class="svg_ic-shape normal"><use xlink:href="../dist/icon-a.svg#ic-shape"/></svg>
                        <svg class="svg_ic-shape active"><use xlink:href="../dist/icon-b.svg#ic-shape"/></svg>
                    </li>
                    <li id="btn-icon">
                        <svg class="svg_ic-icon normal"><use xlink:href="../dist/icon-a.svg#ic-icon"/></svg>
                        <svg class="svg_ic-icon active"><use xlink:href="../dist/icon-b.svg#ic-icon"/></svg>
                    </li>
                    <li id="btn-text">
                        <svg class="svg_ic-text normal"><use xlink:href="../dist/icon-a.svg#ic-text"/></svg>
                        <svg class="svg_ic-text active"><use xlink:href="../dist/icon-b.svg#ic-text"/></svg>
                    </li>
                    <li id="btn-mask">
                        <svg class="svg_ic-mask normal"> <use xlink:href="../dist/icon-a.svg#ic-mask"/> </svg>
                        <svg class="svg_ic-mask active"> <use xlink:href="../dist/icon-b.svg#ic-mask"/> </svg>
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
