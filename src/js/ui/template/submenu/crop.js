/**
 * @param {Locale} locale - Translate text
 * @param {Object} normal - iconStyle
 * @param {Object} active - iconStyle
 * @returns {string}
 */
export default ({locale, svgIconMaker}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li class="tie-crop-preset-button">
            <div class="tui-image-editor-button preset preset-none active">
                <div>
                    ${svgIconMaker(['normal', 'active'], 'shape-rectangle', true)}
                </div>
                <label> ${locale.localize('Custom')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-square">
                <div>
                    ${svgIconMaker(['normal', 'active'], 'crop', true)}
                </div>
                <label> ${locale.localize('Square')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-3-2">
                <div>
                    ${svgIconMaker(['normal', 'active'], 'crop', true)}
                </div>
                <label> ${locale.localize('3:2')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-4-3">
                <div>
                    ${svgIconMaker(['normal', 'active'], 'crop', true)}
                </div>
                <label> ${locale.localize('4:3')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-5-4">
                <div>
                    ${svgIconMaker(['normal', 'active'], 'crop', true)}
                </div>
                <label> ${locale.localize('5:4')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-7-5">
                <div>
                    ${svgIconMaker(['normal', 'active'], 'crop', true)}
                </div>
                <label> ${locale.localize('7:5')} </label>
            </div>
            <div class="tui-image-editor-button preset preset-16-9">
                <div>
                    ${svgIconMaker(['normal', 'active'], 'crop', true)}
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
                ${svgIconMaker(['normal', 'active'], 'apply')}
                <label>
                    ${locale.localize('Apply')}
                </label>
            </div>
            <div class="tui-image-editor-button cancel">
                ${svgIconMaker(['normal', 'active'], 'cancel')}
                <label>
                    ${locale.localize('Cancel')}
                </label>
            </div>
        </li>
    </ul>
`);
