export default ({iconStyle: {normal, active}}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li id="tie-crop-button" class="apply">
            <div class="tui-image-editor-button apply">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-apply" class="normal"/>
                    <use xlink:href="${active.path}#${active.name}-ic-apply" class="active"/>
                </svg>
                <label>
                    Apply
                </label>
            </div>
            <div class="tui-image-editor-button cancel">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-cancel" class="normal"/>
                    <use xlink:href="${active.path}#${active.name}-ic-cancel" class="active"/>
                </svg>
                <label>
                    Cancel
                </label>
            </div>
        </li>
    </ul>
`);
