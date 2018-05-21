import snippet from 'tui-code-snippet';
import Colorpicker from './colorpicker';
import Range from './range';

export default class Filter {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);


        this._btnElement = {
            thresholdRange: new Range(selector('#threshold-range'), 0),
            distanceRange: new Range(selector('#distance-range'), 0),
            gradientTransparencyRange: new Range(selector('#gradient-transparency-range'), 0),
            brightnessRange: new Range(selector('#brightness-range'), 0),
            noiseRange: new Range(selector('#noise-range'), 0),
            pixelateRange: new Range(selector('#pixelate-range'), 0),
            colorfilterThresholeRange: new Range(selector('#colorfilter-threshole-range'), 0),
            filterTinyColor: new Colorpicker(selector('#filter-tiny-color'), ''),
            filterMultiplyColor: new Colorpicker(selector('#filter-multiply-color'), '#ffbb3b'),
            filterBlendColor: new Colorpicker(selector('#filter-blend-color'), '#ffbb3b'),
        };

        const filterOptions = [
            'grayscale',
            'invert',
            'sepia',
            'sepia2',
            'blur',
            'sharpen',
            'emboss',
            'remove-white',
            'gradient-transparency',
            'brightness',
            'noise',
            'pixelate',
            'color-filter',
            'tint',
            'multiply',
            'blend'
        ];

        snippet.forEach(filterOptions, filterName => {
            selector(`#${filterName}`).addEventListener('change', event => {
                const apply = event.target.checked;
                const type = event.target.id.replace(/-([a-z])/g, function($0, $1) { return $1.toUpperCase(); });
                this.actions.applyFilter(apply, type, null);
            });
        });

        const rangeWrap = document.createElement('div');
        rangeWrap.className = 'tui-image-editor-range-wrap';
        const rangelabel = document.createElement('label');
        rangelabel.innerHTML = 'Opacity';
        const rangeaa = document.createElement('div');
        rangeaa.id = "filter-tint-opacity";
        rangeaa.title = "Opacity";
        rangeWrap.appendChild(rangelabel);
        rangeWrap.appendChild(rangeaa);
        this._btnElement.filterTinyColor.pickerControl.appendChild(rangeWrap);
        this._btnElement.filterTinyColor.pickerControl.style.height = '130px';
        new Range(rangeaa, 0);


        const selectlistWrap = document.createElement('div');
        selectlistWrap.className = 'tui-image-editor-selectlist-wrap';
        selectlistWrap.innerHTML = this.createSelectList();
        this._btnElement.filterBlendColor.pickerControl.appendChild(selectlistWrap);
        this._btnElement.filterBlendColor.pickerControl.style.height = '130px';
    }

    createSelectList() {
        return `
           <div class="tui-image-editor-selectlist-wrap">
             <select>
                <option>aa</option>
                <option>bb</option>
             </select>
           </div>
        `;
    }

    addEvent(actions) {
        this.actions = actions;
    }
}
