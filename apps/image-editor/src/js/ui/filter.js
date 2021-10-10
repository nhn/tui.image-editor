import snippet from 'tui-code-snippet';
import Colorpicker from '@/ui/tools/colorpicker';
import Range from '@/ui/tools/range';
import Submenu from '@/ui/submenuBase';
import templateHtml from '@/ui/template/submenu/filter';
import { toInteger, toKebabCase, assignmentForDestroy } from '@/util';
import {
  defaultFilterRangeValues as FILTER_RANGE,
  defaultFilterColorValues as FILTER_COLOR,
  filterOptions,
  eventNames,
  selectorNames,
  filterMenu
} from '@/consts';

const BLEND_OPTIONS = ['add', 'diff', 'subtract', 'multiply', 'screen', 'lighten', 'darken', 'tint'];

/**
 * Filter ui class
 * @class
 * @ignore
 */
class Filter extends Submenu {
  constructor(subMenuElement, { locale, menuBarPosition, usageStatistics }) {
    super(subMenuElement, {
      locale,
      name: 'filter',
      menuBarPosition,
      templateHtml,
      usageStatistics,
    });

    this.selectBoxShow = false;

    this.checkedMap = {};
    this._makeControlElement();
  }

  /**
   * Destroys the instance.
   */
  destroy() {
    this._removeEvent();
    this._destroyToolInstance();

    assignmentForDestroy(this);
  }

  /**
   * Remove event for filter
   */
  _removeEvent() {
    snippet.forEach(filterOptions, (filter) => {
      const filterCheckElement = this.selector(`.tie-${toKebabCase(filter)}`);

      filterCheckElement.removeEventListener('change', this.eventHandler[filter]);
    });

    for(let name in this._els.ranges){
      this._els.ranges[name].off();
    }

    for(let name in this._els.colors){
      this._els.colors[name].off();
    }

    this._els.other.blendType.removeEventListener('change', this.eventHandler.changeBlendFilter);
    this._els.other.blendType.removeEventListener('click', this.eventHandler.changeBlendFilter);

    snippet.forEachArray(
      this.colorPickerInputBoxes,
      (inputBox) => {
        inputBox.removeEventListener(eventNames.FOCUS, this._onStartEditingInputBox.bind(this));
        inputBox.removeEventListener(eventNames.BLUR, this._onStopEditingInputBox.bind(this));
      },
      this
    );
  }

  _destroyToolInstance() {
    for(let name in this._els.ranges){
      this._els.ranges[name].destroy();
    }

    for(let name in this._els.colors){
      this._els.colors[name].destroy();
    }

  }


  _getFilterType(name){
    for(let type in filterMenu){
      if(filterMenu[type].includes(name))return type;
    }
  }
  /**
   * Add event for filter
   * @param {Object} actions - actions for crop
   *   @param {Function} actions.applyFilter - apply filter option
   */
  addEvent({ applyFilter }) {
    const changeFilterState = (filterName) =>
      this._changeFilterState.bind(this, applyFilter, filterName);
    const changeFilterStateForRange = (filterName) => (value, isLast) =>
      this._changeFilterState(applyFilter, filterName, isLast);

    this.eventHandler = {
      changeBlendFilter: changeFilterState('blendColor'),
      changeRemoveColor: changeFilterState('removeColor'),
      blandTypeClick: (event) => event.stopPropagation(),
    };

    snippet.forEach(filterOptions, (filter) => {
      const filterCheckElement = this.selector(`.tie-${toKebabCase(filter)}`);
      this.checkedMap[filter] = filterCheckElement;
      this.eventHandler[filter] = changeFilterState(filter);
      filterCheckElement.addEventListener('change', this.eventHandler[filter]);

      const type = this._getFilterType(filter);

      if(type === 'range'){
        this._els.ranges[filter].on('change', changeFilterStateForRange(filter));
      }else if(type === 'color'){
        this._els.colors[filter].on('change', this.eventHandler.changeBlendFilter);
        this._els.colors[filter].on('changeShow', this.colorPickerChangeShow.bind(this));
      }
    });

    this._els.other.filterBlendThresholdRange.on('change', changeFilterStateForRange('blendColor'));
    this._els.other.removeColorThresholdRange.on('change', changeFilterStateForRange('removeColor'));


    this._els.other.blendType.addEventListener('change', this.eventHandler.changeBlendFilter);
    this._els.other.blendType.addEventListener('click', this.eventHandler.blandTypeClick);

    snippet.forEachArray(
      this.colorPickerInputBoxes,
      (inputBox) => {
        inputBox.addEventListener(eventNames.FOCUS, this._onStartEditingInputBox.bind(this));
        inputBox.addEventListener(eventNames.BLUR, this._onStopEditingInputBox.bind(this));
      },
      this
    );
  }

  /**
   * Set filter for undo changed
   * @param {Object} changedFilterInfos - changed command infos
   *   @param {string} type - filter type
   *   @param {string} action - add or remove
   *   @param {Object} options - filter options
   */
  setFilterState(changedFilterInfos) {
    const { type, options, action } = changedFilterInfos;
    const filterName = this._getFilterNameFromOptions(type, options);
    const isRemove = action === 'remove';

    if (!isRemove) {
      this._setFilterState(filterName, options);
    }

    this.checkedMap[filterName].checked = !isRemove;
  }

  /**
   * Init all filter's checkbox to unchecked state
   */
  initFilterCheckBoxState() {
    snippet.forEach(
      this.checkedMap,
      (filter) => {
        filter.checked = false;
      },
      this
    );
  }

  /**
   * Set filter for undo changed
   * @param {string} filter - filter name
   * @param {Object} option - filter options
   * @private
   */
  // eslint-disable-next-line complexity
  _setFilterState(filter, option) {
    let value;
    switch (filter) {
      case 'removeColor':
        option.color = value;
        this._els.other.removeColorThresholdRange.value = option.distance;
        break;
      case 'pixelate':
        value = option.blocksize;
        break;
      case 'noise':
        value = option.noise;
        break;
      case 'brightness':
        value = option.brightness * 100;
        break;
      case 'contrast':
        value = option.contrast * 100;
        break;
      case 'saturation':
        value = option.saturation * 100;
        break;
      case 'blendColor':
        value = option.color;
        this._els.other.filterBlendThresholdRange.value = option.alpha;
        this._els.other.blendType.value = option.mode;
        break;
      case 'blur':
        value = option.blur * 100;
        break;
      case 'vibrance':
        value = option.vibrance * 100;
        break;
      case 'hueRotation':
        value = option.rotation * 100;
        break;
    }
    const type = this._getFilterType(filter);
    if(type === 'color'){
      this._els.colors[filter].color = value;
    }else if(type === 'range'){
      this._els.ranges[filter].value = value;
    }
  }

  /**
   * Get filter name
   * @param {string} type - filter type
   * @param {Object} options - filter options
   * @returns {string} filter name
   * @private
   */
  _getFilterNameFromOptions(type, options) {
    let filterName = type;
    return filterName;
  }

  /**
   * Add event for filter
   * @param {Function} applyFilter - actions for firter
   * @param {string} filterName - filter name
   * @param {boolean} [isLast] - Is last change
   */
  _changeFilterState(applyFilter, filterName, isLast = true) {
    console.log('t',this.checkedMap, filterName);
    const apply = this.checkedMap[filterName].checked;

    const checkboxGroup = this.checkedMap[filterName].closest('.tui-image-editor-checkbox-group');
    if (checkboxGroup) {
      if (apply) {
        checkboxGroup.classList.remove('tui-image-editor-disabled');
      } else {
        checkboxGroup.classList.add('tui-image-editor-disabled');
      }
    }
    applyFilter(apply, filterName, this._getFilterOption(filterName), !isLast);
  }

  /**
   * Get filter option
   * @param {String} type - filter type
   * @returns {Object} filter option object
   * @private
   */
  // eslint-disable-next-line complexity
  _getFilterOption(filter) {
    const option = {};
    const type = this._getFilterType(filter);
    
    let value;
    if(type === 'color'){
      value = this._els.colors[filter].color;
    }else if(type === 'range'){
      value = this._els.ranges[filter].value;
    }
    switch (filter) {
      case 'removeColor':
        option.color = value;
        option.distance = parseFloat(this._els.other.removeColorThresholdRange.value);
        break;
      case 'pixelate':
        option.blocksize = toInteger(value);
        break;
      case 'noise':
        option.noise = toInteger(value);
        break;
      case 'brightness':
        option.brightness = parseFloat(value) / 100;
        break;
      case 'contrast':
        option.contrast = parseFloat(value) / 100;
        break;
      case 'saturation':
        option.saturation = parseFloat(value) / 100;
        break;
      case 'blendColor':
        option.color = value;
        option.alpha = parseFloat(this._els.other.filterBlendThresholdRange.value);
        option.mode = this._els.other.blendType.value;
        break;
      case 'blur':
        option.blur = parseFloat(value) / 100;
        break;
      case 'vibrance':
        option.vibrance = parseFloat(value) / 100;
        break;
      case 'hueRotation':
        option.rotation = parseFloat(value) / 100;
        break;
    }

    return option;
  }

  /**
   * Make submenu range and colorpicker control
   * @private
   */
  _makeControlElement() {
    this._els = {
      ranges: {},
      colors: {},
      other: {}
    };


    filterMenu.range.forEach((name) => {
      const tag = toKebabCase(name);
      this._els.ranges[name] = new Range(
        {
          slider: this.selector(`.tie-${tag}-range`),
          input: this.selector(`.tie-${tag}-range-value`),
        },
        FILTER_RANGE[name]
      );
    });

    this.colorPickerInputBoxes = [];

    filterMenu.color.forEach((name) => {
      const tag = toKebabCase(name);
      const colorpicker = new Colorpicker(
        this.selector(`.tie-${tag}-color`),
        FILTER_COLOR[name],
        this.toggleDirection,
        this.usageStatistics
      );

      this._els.colors[name] = colorpicker;
      this.colorPickerControls.push(this._els.colors[name]);

      this.colorPickerInputBoxes.push(
        colorpicker.colorpickerElement.querySelector(selectorNames.COLOR_PICKER_INPUT_BOX)
      );
    });

    this._els.other.blendType = this._pickerWithSelectbox(this._els.colors.blendColor.pickerControl);
    this._els.other.removeColorThresholdRange = this._pickerWithRange(
      this._els.colors.removeColor.pickerControl,
      FILTER_RANGE.removeColorThresholdRange,
      'Threshold'
    );

    this._els.other.filterBlendThresholdRange = this._pickerWithRange(
      this._els.colors.blendColor.pickerControl,
      FILTER_RANGE.removeColorThresholdRange,
      'Opacity'
    );
  }

  /**
   * Make submenu control for picker & range mixin
   * @param {HTMLElement} pickerControl - pickerControl dom element
   * @param {Object} range - options for range
   * @param {String} label - name of control
   * @returns {Range}
   * @private
   */
  _pickerWithRange(pickerControl, range, label) {
    const rangeWrap = document.createElement('div');
    const rangeLabel = document.createElement('label');
    const slider = document.createElement('div');

    //slider.id = 'tie-filter-tint-opacity';
    rangeLabel.innerHTML = label;
    rangeWrap.appendChild(rangeLabel);
    rangeWrap.appendChild(slider);
    pickerControl.appendChild(rangeWrap);

    return new Range({ slider }, range);
  }

  /**
   * Make submenu control for picker & selectbox
   * @param {HTMLElement} pickerControl - pickerControl dom element
   * @returns {HTMLElement}
   * @private
   */
  _pickerWithSelectbox(pickerControl) {
    const selectlistWrap = document.createElement('div');
    const selectlist = document.createElement('select');
    const optionlist = document.createElement('ul');

    selectlistWrap.className = 'tui-image-editor-selectlist-wrap';
    optionlist.className = 'tui-image-editor-selectlist';

    selectlistWrap.appendChild(selectlist);
    selectlistWrap.appendChild(optionlist);

    this._makeSelectOptionList(selectlist);

    pickerControl.appendChild(selectlistWrap);

    this._drawSelectOptionList(selectlist, optionlist);
    this._pickerWithSelectboxForAddEvent(selectlist, optionlist);

    return selectlist;
  }

  /**
   * Make selectbox option list custom style
   * @param {HTMLElement} selectlist - selectbox element
   * @param {HTMLElement} optionlist - custom option list item element
   * @private
   */
  _drawSelectOptionList(selectlist, optionlist) {
    const options = selectlist.querySelectorAll('option');
    snippet.forEach(options, (option) => {
      const optionElement = document.createElement('li');
      optionElement.innerHTML = option.innerHTML;
      optionElement.setAttribute('data-item', option.value);
      optionlist.appendChild(optionElement);
    });
  }

  /**
   * custom selectbox custom event
   * @param {HTMLElement} selectlist - selectbox element
   * @param {HTMLElement} optionlist - custom option list item element
   * @private
   */
  _pickerWithSelectboxForAddEvent(selectlist, optionlist) {
    optionlist.addEventListener('click', (event) => {
      const optionValue = event.target.getAttribute('data-item');
      const fireEvent = document.createEvent('HTMLEvents');

      selectlist.querySelector(`[value="${optionValue}"]`).selected = true;
      fireEvent.initEvent('change', true, true);

      selectlist.dispatchEvent(fireEvent);

      this.selectBoxShow = false;
      optionlist.style.display = 'none';
    });

    selectlist.addEventListener('mousedown', (event) => {
      event.preventDefault();
      this.selectBoxShow = !this.selectBoxShow;
      optionlist.style.display = this.selectBoxShow ? 'block' : 'none';
      optionlist.setAttribute('data-selectitem', selectlist.value);
      optionlist.querySelector(`[data-item='${selectlist.value}']`).classList.add('active');
    });
  }

  /**
   * Make option list for select control
   * @param {HTMLElement} selectlist - blend option select list element
   * @private
   */
  _makeSelectOptionList(selectlist) {
    snippet.forEach(BLEND_OPTIONS, (option) => {
      const selectOption = document.createElement('option');
      selectOption.setAttribute('value', option);
      selectOption.innerHTML = option.replace(/^[a-z]/, ($0) => $0.toUpperCase());
      selectlist.appendChild(selectOption);
    });
  }
}

export default Filter;
