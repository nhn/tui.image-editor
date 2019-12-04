/**
 * @param {Locale} locale - Translate text
 * @param {Object} normal - iconStyle
 * @param {Object} active - iconStyle
 * @returns {string}
 */
export default ({locale, iconStyle: {normal, active}}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li class="tie-crop-preset-button">
            <div class="tui-image-editor-button preset preset-none active">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-shape-rectangle"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-shape-rectangle"
                            class="active"/>
                    </svg>
                </div>
                <label> ${locale.localize('Custom')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-square">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-crop"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-crop"
                            class="active"/>
                    </svg>
                </div>
                <label> ${locale.localize('Square')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-3-2">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-crop"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-crop"
                            class="active"/>
                    </svg>
                </div>
                <label> ${locale.localize('3:2')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-4-3">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-crop"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-crop"
                            class="active"/>
                    </svg>
                </div>
                <label> ${locale.localize('4:3')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-5-4">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-crop"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-crop"
                            class="active"/>
                    </svg>
                </div>
                <label> ${locale.localize('5:4')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-7-5">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-crop"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-crop"
                            class="active"/>
                    </svg>
                </div>
                <label> ${locale.localize('7:5')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-16-9">
                <div>
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-crop"
                            class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-crop"
                            class="active"/>
                    </svg>
                </div>
                <label> ${locale.localize('16:9')} </label>
            </div>
        </li>
        <li class="tui-image-editor-partition tui-image-editor-newline">
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li class="tie-crop-button action">
            <div class="tui-image-editor-button apply">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-apply" class="normal"/>
                    <use xlink:href="${active.path}#${active.name}-ic-apply" class="active"/>
                </svg>
                <label>
                    ${locale.localize('Apply')}
                </label>
            </div>
            <div class="tui-image-editor-button cancel">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-cancel" class="normal"/>
                    <use xlink:href="${active.path}#${active.name}-ic-cancel" class="active"/>
                </svg>
                <label>
                    ${locale.localize('Cancel')}
                </label>
            </div>
        </li>
    </ul>
`);
