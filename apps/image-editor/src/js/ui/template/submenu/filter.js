import {filterMenu} from '@/consts';
import {toKebabCase, getFilterName} from '@/util';


function rangeLayout(ranges, locale){
    return ranges.map((type) => {
        const kebab = toKebabCase(type);
        return `
        <div class="tui-image-editor-checkbox-group tui-image-editor-disabled">
            <div class="tui-image-editor-checkbox">
                <label>
                    <input type="checkbox" class="tie-${kebab}">
                    <span>${locale.localize(getFilterName(type))}</span>
                </label>
            </div>
            <div class="tui-image-editor-range-wrap short">
                <div class="tie-${kebab}-range"></div>
                <input class="tie-${kebab}-range-value tui-image-editor-range-value tui-image-editor-range-value-no-margin"/>
            </div>
        </div>
    `}).join('')
}

const leftRange = filterMenu.range.slice(0, Math.ceil(filterMenu.range.length / 2));
const rightRange = filterMenu.range.slice(Math.floor(filterMenu.range.length / 2), filterMenu.range.length);

/**
 * @param {Locale} locale - Translate text
 * @returns {string}
 */
export default ({ locale }) => `
 <ul class="tui-image-editor-submenu-item">
     <li class="tui-image-editor-submenu-align">
        <div class="tui-image-editor-checkbox-wrap fixed-width">
            ${filterMenu.basic.map((type) => `
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-${toKebabCase(type)}">
                        <span>${locale.localize(getFilterName(type))}</span>
                    </label>
                </div>
            `).join('')}
        </div>
     </li>
     <li class="tui-image-editor-partition">
         <div></div>
     </li>
     <li class="tui-image-editor-submenu-align">
        ${rangeLayout(leftRange, locale)}
     </li>
     <li class="tui-image-editor-partition only-left-right">
         <div></div>
     </li>
     <li class="tui-image-editor-submenu-align">
        ${rangeLayout(rightRange, locale)}
     </li>
     <li class="tui-image-editor-partition">
         <div></div>
     </li>
     <li>
        ${filterMenu.color.map((type) => `
            <div class="filter-color-item">
                <div class="tie-${toKebabCase(type)}-color" title="${locale.localize(getFilterName(type))}"></div>
                <div class="tui-image-editor-checkbox">
                    <label>
                        <input type="checkbox" class="tie-${toKebabCase(type)}">
                        <span></span>
                    </label>
                </div>
            </div>
         `).join('')}
     </li>
 </ul>
`;