import Colorpicker from './tools/colorpicker';
import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/filtersection';
import {toInteger, assignmentForDestroy} from '../util';
import {
    defaultFiltersectionPixelateValus,
    defaultFiltersectionRadiusValus
} from '../consts';

const FILTER_SECTION_DEFAULT_OPTION = {
    stroke: '#ffbb3b',
    fill: '',
    radiusValue: 0,
    pixelateValue: 25
};

/**
 * Shape ui class
 * @class
 * @ignore
 */
class Filtersection extends Submenu {
    constructor(
        subMenuElement,
        {locale, makeSvgIcon, menuBarPosition, usageStatistics}
    ) {
        super(subMenuElement, {
            locale,
            name: 'filtersection',
            makeSvgIcon,
            menuBarPosition,
            templateHtml,
            usageStatistics
        });
        this.type = null;
        this.options = FILTER_SECTION_DEFAULT_OPTION;

        this._els = {
            applyButton: this.selector('.tie-filtersection-button .apply'),
            filtersectionSelectButton: this.selector(
                '.tie-filtersection-button'
            ),
            filtersectionColorButton: this.selector(
                '.tie-filtersection-color-button'
            ),
            radiusRange: new Range(
                {
                    slider: this.selector('.tie-radius-range-filtersection'),
                    input: this.selector(
                        '.tie-radius-range-value-filtersection'
                    )
                },
                defaultFiltersectionRadiusValus
            ),
            pixelateRange: new Range(
                {
                    slider: this.selector('.tie-pixelate-range-filtersection'),
                    input: this.selector(
                        '.tie-pixelate-range-value-filtersection'
                    )
                },
                defaultFiltersectionPixelateValus
            ),
            // fillColorpicker: new Colorpicker(
            //     this.selector('.tie-color-fill-filtersection'),
            //     '',
            //     this.toggleDirection,
            //     this.usageStatistics
            // ),
            strokeColorpicker: new Colorpicker(
                this.selector('.tie-color-stroke-filtersection'),
                '#ffbb3b',
                this.toggleDirection,
                this.usageStatistics
            )
        };

        // this.colorPickerControls.push(this._els.fillColorpicker);
        this.colorPickerControls.push(this._els.strokeColorpicker);
    }

    /**
     * Destroys the instance.
     */
    destroy() {
        this._removeEvent();
        this._els.radiusRange.destroy();
        this._els.pixelateRange.destroy();
        // this._els.fillColorpicker.destroy();
        this._els.strokeColorpicker.destroy();

        assignmentForDestroy(this);
    }

    /**
     * Add event for shape
     * @param {Object} actions - actions for shape
     *   @param {Function} actions.changeShape - change shape mode
     *   @param {Function} actions.setDrawingShape - set dreawing shape
     */
    addEvent(actions) {
        const apply = this._applyEventHandler.bind(this);
        const filtersectionTypeSelected = this._changeFiltersectionHandler.bind(
            this
        );

        this.eventHandler = {
            apply,
            filtersectionTypeSelected
        };

        this.actions = actions;

        this._els.filtersectionSelectButton.addEventListener(
            'click',
            filtersectionTypeSelected
        );
        this._els.applyButton.addEventListener('click', apply);
        this._els.radiusRange.on(
            'change',
            this._changeRadiusRangeHandler.bind(this)
        );
        this._els.pixelateRange.on(
            'change',
            this._changePixelateRangeHandler.bind(this)
        );
        // this._els.fillColorpicker.on(
        //     'change',
        //     this._changeFillColorHandler.bind(this)
        // );
        this._els.strokeColorpicker.on(
            'change',
            this._changeStrokeColorHandler.bind(this)
        );
        // this._els.fillColorpicker.on(
        //     'changeShow',
        //     this.colorPickerChangeShow.bind(this)
        // );
        this._els.strokeColorpicker.on(
            'changeShow',
            this.colorPickerChangeShow.bind(this)
        );
    }

    /**
     * Remove event
     * @private
     */
    _removeEvent() {
        this._els.filtersectionSelectButton.removeEventListener(
            'click',
            this.eventHandler.filtersectionTypeSelected
        );
        this._els.applyButton.removeEventListener('click', this.eventHandler.apply);
        this._els.radiusRange.off();
        this._els.pixelateRange.off();
        // this._els.fillColorpicker.off();
        this._els.strokeColorpicker.off();
    }

    _applyEventHandler() {
        this.actions.applyFiltersection();
    }

    /**
     * Set Shape status
     * @param {Object} options - options of shape status
     *   @param {string} strokeWidth - stroke width
     *   @param {string} strokeColor - stroke color
     *   @param {string} fillColor - fill color
     */
    setFiltersectionStatus({
        radiusValue,
        pixelateValue,
        strokeColor,
        fillColor
    }) {
        this._els.radiusRange.value = radiusValue;
        this._els.pixelateRange.value = pixelateValue;
        this._els.strokeColorpicker.color = strokeColor;
        // this._els.fillColorpicker.color = fillColor;
        this.options.stroke = strokeColor;
        this.options.fill = fillColor;
        this.options.radiusValue = radiusValue;
        this.actions.setDrawingFiltersection(this.type, {radiusValue});
    }

    /**
     * Executed when the menu starts.
     */
    changeStartMode() {
        this.actions.stopDrawingMode();
    }

    /**
     * Returns the menu to its default state.
     */
    changeStandbyMode() {
        this.type = null;
        this.actions.changeSelectableAll(true);
        this._els.filtersectionSelectButton.classList.remove(
            'circle-filtersection'
        );
        this._els.filtersectionSelectButton.classList.remove(
            'triangle-filtersection'
        );
        this._els.filtersectionSelectButton.classList.remove(
            'rect-filtersection'
        );
    }

    /**
     * set range stroke max value
     * @param {number} maxValue - expect max value for change
     */
    setMaxRadiusValue(maxValue) {
        let radiusMaxValue = maxValue;
        if (radiusMaxValue <= 0) {
            radiusMaxValue = defaultFiltersectionRadiusValus.max;
        }
        this._els.radiusRange.max = radiusMaxValue;
    }

    /**
     * Set stroke value
     * @param {number} value - expect value for strokeRange change
     */
    setRadiusValue(value) {
        this._els.radiusRange.value = value;
        this._els.radiusRange.trigger('change');
    }

    setPixelateValue(value) {
        this._els.pixelateRange.value = value;
        this._els.pixelateRange.trigger('change');
    }

    /**
     * Get stroke value
     * @returns {number} - stroke range value
     */
    getRadiusValue() {
        return this._els.radiusRange.value;
    }

    getPixelateValue() {
        return this._els.pixelateRange.value;
    }

    /**
     * Change icon color
     * @param {object} event - add button event object
     * @private
     */
    _changeFiltersectionHandler(event) {
        const button = event.target.closest(
            '.tui-image-editor-button.filtersection'
        );
        if (button) {
            this.actions.stopDrawingMode();
            this.actions.discardSelection();
            const filtersectionType = this.getButtonType(button, [
                'circle-filtersection',
                'triangle-filtersection',
                'rect-filtersection'
            ]);

            if (this.type === filtersectionType) {
                this.changeStandbyMode();

                return;
            }
            this.changeStandbyMode();
            this.type = filtersectionType;
            event.currentTarget.classList.add(filtersectionType);
            this.actions.changeSelectableAll(false);
            this.actions.modeChange('filtersection');
        }
    }

    /**
     * Change stroke range
     * @param {number} value - stroke range value
     * @param {boolean} isLast - Is last change
     * @private
     */
    _changeRadiusRangeHandler(value, isLast) {
        this.options.radiusValue = toInteger(value);
        this.actions.changeFiltersection(
            {
                radiusValue: value
            },
            !isLast
        );
        this.actions.setDrawingFiltersection(this.type, this.options);
    }

    _changePixelateRangeHandler(value, isLast) {
        this.options.pixelateValue = toInteger(value);
        this.actions.changeFiltersection(
            {
                pixelateValue: value
            },
            !isLast
        );
        this.actions.setDrawingFiltersection(this.type, this.options);
    }

    /**
     * Change shape color
     * @param {string} color - fill color
     * @private
     */
    _changeFillColorHandler(color) {
        color = color || 'transparent';
        this.options.fill = color;
        this.actions.changeFiltersection({
            fill: color
        });
    }

    /**
     * Change shape stroke color
     * @param {string} color - fill color
     * @private
     */
    _changeStrokeColorHandler(color) {
        color = color || 'transparent';
        this.options.stroke = color;
        this.actions.changeFiltersection({
            stroke: color
        });
    }
}

export default Filtersection;
