export default ({iconStyle: {normal, active}}) => (`
    <ul id="tie-flip-button" class="tui-image-editor-submenu-item">
        <li>
            <div class="tui-image-editor-button flipX">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-flip-x" class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-flip-x" class="active"/>
                    </svg>
                </div>
                <label>
                    Flip X
                </label>
            </div>
            <div class="tui-image-editor-button flipY">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-flip-y" class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-flip-y" class="active"/>
                    </svg>
                </div>
                <label>
                    Flip Y
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="tui-image-editor-button resetFlip">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-flip-reset"
                            class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-flip-reset"
                            class="active"/>
                    </svg>
                </div>
                <label>
                    Reset
                </label>
            </div>
        </li>
    </ul>
`);
