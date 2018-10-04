export default ({iconStyle: {normal, active}}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li id="tie-text-effect-button">
            <div class="tui-image-editor-button bold">
                <div>
                    <svg class="svg_ic-submenu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-text-bold" class="normal"/>
                    <use xlink:href="${active.path}#${active.name}-ic-text-bold" class="active"/>
                    </svg>
                </div>
                <label> Bold </label>
            </div>
            <div class="tui-image-editor-button italic">
                <div>
                    <svg class="svg_ic-submenu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-text-italic" class="normal"/>
                    <use xlink:href="${active.path}#${active.name}-ic-text-italic" class="active"/>
                    </svg>
                </div>
                <label> Italic </label>
            </div>
            <div class="tui-image-editor-button underline">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-text-underline"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-text-underline"
                            class="active"/>
                    </svg>
                </div>
                <label> Underline </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li id="tie-text-align-button">
            <div class="tui-image-editor-button left">
                <div>
                    <svg class="svg_ic-submenu">
                     <use xlink:href="${normal.path}#${normal.name}-ic-text-align-left"
                        class="normal"/>
                     <use xlink:href="${active.path}#${active.name}-ic-text-align-left"
                        class="active"/>
                    </svg>
                </div>
                <label> Left </label>
            </div>
            <div class="tui-image-editor-button center">
                <div>
                    <svg class="svg_ic-submenu">
                     <use xlink:href="${normal.path}#${normal.name}-ic-text-align-center"
                        class="normal"/>
                     <use xlink:href="${active.path}#${active.name}-ic-text-align-center"
                        class="active"/>
                    </svg>
                </div>
                <label> Center </label>
            </div>
            <div class="tui-image-editor-button right">
                <div>
                    <svg class="svg_ic-submenu">
                     <use xlink:href="${normal.path}#${normal.name}-ic-text-align-right"
                        class="normal"/>
                     <use xlink:href="${active.path}#${active.name}-ic-text-align-right"
                        class="active"/>
                    </svg>
                </div>
                <label> Right </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div id="tie-text-color" title="Color"></div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tui-image-editor-newline tui-image-editor-range-wrap">
            <label class="range">Text size</label>
            <div id="tie-text-range"></div>
            <input id="tie-text-range-value" class="tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`);
