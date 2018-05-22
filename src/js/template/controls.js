export default `
    <div class="tui-image-editor-controls">
        <div class="tui-image-editor-controls-logo">
            <img src="img/icon/img-bi.svg" />
        </div>
        <ul class="tui-image-editor-menu">
            <li id="btn-undo" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-undo" class="normal"/>
                    <use xlink:href="../dist/icon-b.svg#icon-b-ic-undo" class="active"/>
                </svg>
            </li>
            <li id="btn-redo" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-redo" class="normal"/>
                    <use xlink:href="../dist/icon-b.svg#icon-b-ic-redo" class="active"/>
                </svg>
            </li>
            <li id="btn-reset" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-reset" class="normal"/>
                    <use xlink:href="../dist/icon-b.svg#icon-b-ic-reset" class="active"/>
                </svg>
            </li>
            <li class="item">
                <div class="tui-image-editor-icpartition"></div>
            </li>
            <li id="btn-delete" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-delete" class="normal"/>
                    <use xlink:href="../dist/icon-b.svg#icon-b-ic-delete" class="active"/>
                </svg>
            </li>
            <li id="btn-delete-all" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="../dist/icon-a.svg#icon-a-ic-delete-all" class="normal"/>
                    <use xlink:href="../dist/icon-b.svg#icon-b-ic-delete-all" class="active"/>
                </svg>
            </li>
            <li class="item">
                <div class="tui-image-editor-icpartition"></div>
            </li>
        </ul>

        <div class="tui-image-editor-controls-buttons">
            <button>Load</button>
            <button class="download">Download</button>
        </div>
    </div>
`;
