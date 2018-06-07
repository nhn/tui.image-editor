export default ({iconStyle: {normal, active}}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li id="tie-shape-button" class="rect">
            <div class="tui-image-editor-button rect">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-shape-rectangle"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-shape-rectangle"
                            class="active"/>
                    </svg>
                </div>
                <label> Rectangle </label>
            </div>
            <div class="tui-image-editor-button circle">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-shape-circle"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-shape-circle"
                            class="active"/>
                    </svg>
                </div>
                <label> Circle </label>
            </div>
            <div class="tui-image-editor-button triangle">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-shape-triangle"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-shape-triangle"
                            class="active"/>
                    </svg>
                </div>
                <label> Triangle </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li id="tie-shape-color-button">
            <div id="tie-color-fill" title="fill"></div>
            <div id="tie-color-stroke" title="stroke"></div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="newline tui-image-editor-range-wrap">
            <label class="range">Stroke</label>
            <div id="tie-stroke-range"></div>
            <input id="tie-stroke-range-value" class="tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`);
