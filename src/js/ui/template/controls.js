export default ({iconStyle: {normal, active}}) => (`
    <div class="tui-image-editor-controls">
        <div class="tui-image-editor-controls-logo">
            <img src="img/icon/img-bi.svg" />
        </div>
        <ul class="tui-image-editor-menu">
            <li id="btn-undo" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-undo" class="enabled"/>
                    <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-undo" class="normal"/>
                </svg>
            </li>
            <li id="btn-redo" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-redo" class="enabled"/>
                    <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-redo" class="normal"/>
                </svg>
            </li>
            <li id="btn-reset" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-reset" class="enabled"/>
                    <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-reset" class="normal"/>
                </svg>
            </li>
            <li class="item">
                <div class="tui-image-editor-icpartition"></div>
            </li>
            <li id="btn-delete" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-delete" class="enabled"/>
                    <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-delete" class="normal"/>
                </svg>
            </li>
            <li id="btn-delete-all" class="item">
                <svg class="svg_ic-menu">
                    <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-delete-all" class="enabled"/>
                    <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-delete-all" class="normal"/>
                </svg>
            </li>
            <li class="item">
                <div class="tui-image-editor-icpartition"></div>
            </li>
        </ul>

        <div class="tui-image-editor-controls-buttons">
            <button class="tui-image-editor-load-btn">Load</button>
            <button class="tui-image-editor-download-btn download">Download</button>
        </div>
    </div>
`);
