/**
 * @param {Object} submenuInfo - submenu info for make template
 *   @param {Locale} locale - Translate text
 *   @param {Function} makeSvgIcon - svg icon generator
 * @returns {string}
 */
export default ({ locale, makeSvgIcon }) => `
    <ul class="tie-zoom-button tui-image-editor-submenu-item">
        <li>
            <div class="tui-image-editor-button flipX zoomIn">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'flip-x', true)}
                </div>
                <label>
                    ${locale.localize('Zoom In')}
                </label>
            </div>
            <div class="tui-image-editor-button flipY zoomOut">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'flip-y', true)}
                </div>
                <label>
                    ${locale.localize('Zoom Out')}
                </label>
            </div>
        </li>
        <li class="tui-image-editor-partition">
            <div></div>
        </li>
        <li>
            <div class="tui-image-editor-button resetFlip hand">
                <div>
                    ${makeSvgIcon(['normal', 'active'], 'flip-reset', true)}
                </div>
                <label>
                    ${locale.localize('Hand')}
                </label>
            </div>
        </li>
    </ul>
`;
