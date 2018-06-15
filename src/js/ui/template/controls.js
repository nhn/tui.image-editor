export default ({biImage, iconStyle: {normal, active}}) => (`
    <div class="tui-image-editor-controls">
        <div class="tui-image-editor-controls-logo">
            <img src="${biImage}" height="21px" />
        </div>
        <ul class="tui-image-editor-menu">
            <li id="tie-btn-undo" class="tui-image-editor-item" title="undo">
                <svg class="svg_ic-menu">
                    <use xlink:href="${active.path}#${active.name}-ic-undo" class="enabled"/>
                    <use xlink:href="${normal.path}#${normal.name}-ic-undo" class="normal"/>
                </svg>
            </li>
            <li id="tie-btn-redo" class="tui-image-editor-item" title="redo">
                <svg class="svg_ic-menu">
                    <use xlink:href="${active.path}#${active.name}-ic-redo" class="enabled"/>
                    <use xlink:href="${normal.path}#${normal.name}-ic-redo" class="normal"/>
                </svg>
            </li>
            <li id="tie-btn-reset" class="tui-image-editor-item" title="reset">
                <svg class="svg_ic-menu">
                    <use xlink:href="${active.path}#${active.name}-ic-reset" class="enabled"/>
                    <use xlink:href="${normal.path}#${normal.name}-ic-reset" class="normal"/>
                </svg>
            </li>
            <li class="tui-image-editor-item">
                <div class="tui-image-editor-icpartition"></div>
            </li>
            <li id="tie-btn-delete" class="tui-image-editor-item" title="delete">
                <svg class="svg_ic-menu">
                    <use xlink:href="${active.path}#${active.name}-ic-delete" class="enabled"/>
                    <use xlink:href="${normal.path}#${normal.name}-ic-delete" class="normal"/>
                </svg>
            </li>
            <li id="tie-btn-delete-all" class="tui-image-editor-item" title="d-all">
                <svg class="svg_ic-menu">
                    <use xlink:href="${active.path}#${active.name}-ic-delete-all" class="enabled"/>
                    <use xlink:href="${normal.path}#${normal.name}-ic-delete-all" class="normal"/>
                </svg>
            </li>
            <li class="tui-image-editor-item">
                <div class="tui-image-editor-icpartition"></div>
            </li>
        </ul>

        <div class="tui-image-editor-controls-buttons">
            <button class="tui-image-editor-load-btn">Load</button>
            <button class="tui-image-editor-download-btn download">Download</button>
        </div>
    </div>
`);
