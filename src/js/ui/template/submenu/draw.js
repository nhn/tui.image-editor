export default ({iconStyle: {normal, active}}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li id="draw-line-select-button" class="line">
            <div class="button free">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-draw-free" class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-draw-free" class="active"/>
                    </svg>
                </div>
                <label>
                    Free
                </label>
            </div>
            <div class="button line">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-draw-line" class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-draw-line" class="active"/>
                    </svg>
                </div>
                <label>
                    Straight
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div id="draw-color" title="Color"></div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="newline tui-image-editor-range-wrap">
            <label class="range">Range</label>
            <div id="draw-range"></div>
            <input id="draw-range-value" class="tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`);
