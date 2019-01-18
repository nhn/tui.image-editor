export default ({
    subMenuLabelActive,
    subMenuLabelNormal,
    subMenuRangeTitle,
    submenuPartitionVertical,
    submenuPartitionHorizontal,
    submenuCheckbox,
    submenuRangePointer,
    submenuRangeValue,
    submenuColorpickerTitle,
    submenuColorpickerButton,
    submenuRangeBar,
    submenuRangeSubbar,
    submenuDisabledRangePointer,
    submenuDisabledRangeBar,
    submenuDisabledRangeSubbar,
    submenuIconSize,
    menuIconSize,
    biSize
}) => (`
    #tie-icon-add-button.icon-bubble .tui-image-editor-button[data-icontype="icon-bubble"] label,
    #tie-icon-add-button.icon-heart .tui-image-editor-button[data-icontype="icon-heart"] label,
    #tie-icon-add-button.icon-location .tui-image-editor-button[data-icontype="icon-location"] label,
    #tie-icon-add-button.icon-polygon .tui-image-editor-button[data-icontype="icon-polygon"] label,
    #tie-icon-add-button.icon-star .tui-image-editor-button[data-icontype="icon-star"] label,
    #tie-icon-add-button.icon-star-2 .tui-image-editor-button[data-icontype="icon-star-2"] label,
    #tie-icon-add-button.icon-arrow-3 .tui-image-editor-button[data-icontype="icon-arrow-3"] label,
    #tie-icon-add-button.icon-arrow-2 .tui-image-editor-button[data-icontype="icon-arrow-2"] label,
    #tie-icon-add-button.icon-arrow .tui-image-editor-button[data-icontype="icon-arrow"] label,
    #tie-icon-add-button.icon-bubble .tui-image-editor-button[data-icontype="icon-bubble"] label,
    #tie-draw-line-select-button.line .tui-image-editor-button.line label,
    #tie-draw-line-select-button.free .tui-image-editor-button.free label,
    #tie-flip-button.flipX .tui-image-editor-button.flipX label,
    #tie-flip-button.flipY .tui-image-editor-button.flipY label,
    #tie-flip-button.resetFlip .tui-image-editor-button.resetFlip label,
    #tie-crop-button .tui-image-editor-button.apply.active label,
    #tie-crop-preset-button .tui-image-editor-button.preset.active label,
    #tie-shape-button.rect .tui-image-editor-button.rect label,
    #tie-shape-button.circle .tui-image-editor-button.circle label,
    #tie-shape-button.triangle .tui-image-editor-button.triangle label,
    #tie-text-effect-button .tui-image-editor-button.active label,
    #tie-text-align-button.left .tui-image-editor-button.left label,
    #tie-text-align-button.center .tui-image-editor-button.center label,
    #tie-text-align-button.right .tui-image-editor-button.right label,
    #tie-mask-apply.apply.active .tui-image-editor-button.apply label,
    .tui-image-editor-container .tui-image-editor-submenu .tui-image-editor-button:hover > label,
    .tui-image-editor-container .tui-image-editor-checkbox input + label {
        ${subMenuLabelActive}
    }
    .tui-image-editor-container .tui-image-editor-submenu .tui-image-editor-button > label,
    .tui-image-editor-container .tui-image-editor-range-wrap.tui-image-editor-newline.short label {
        ${subMenuLabelNormal}
    }
    .tui-image-editor-container .tui-image-editor-range-wrap label {
        ${subMenuRangeTitle}
    }
    .tui-image-editor-container .tui-image-editor-partition > div {
        ${submenuPartitionVertical}
    }
    .tui-image-editor-container.left .tui-image-editor-submenu .tui-image-editor-partition > div,
    .tui-image-editor-container.right .tui-image-editor-submenu .tui-image-editor-partition > div {
        ${submenuPartitionHorizontal}
    }
    .tui-image-editor-container .tui-image-editor-checkbox input + label:before {
        ${submenuCheckbox}
    }
    .tui-image-editor-container .tui-image-editor-checkbox input:checked + label:before {
        border: 0;
    }
    .tui-image-editor-container .tui-image-editor-virtual-range-pointer {
        ${submenuRangePointer}
    }
    .tui-image-editor-container .tui-image-editor-virtual-range-bar {
        ${submenuRangeBar}
    }
    .tui-image-editor-container .tui-image-editor-virtual-range-subbar {
        ${submenuRangeSubbar}
    }
    .tui-image-editor-container .tui-image-editor-disabled .tui-image-editor-virtual-range-pointer {
        ${submenuDisabledRangePointer}
    }
    .tui-image-editor-container .tui-image-editor-disabled .tui-image-editor-virtual-range-subbar {
        ${submenuDisabledRangeSubbar}
    }
    .tui-image-editor-container .tui-image-editor-disabled .tui-image-editor-virtual-range-bar {
        ${submenuDisabledRangeBar}
    }
    .tui-image-editor-container .tui-image-editor-range-value {
        ${submenuRangeValue}
    }
    .tui-image-editor-container .tui-image-editor-submenu .tui-image-editor-button .color-picker-value + label {
        ${submenuColorpickerTitle}
    }
    .tui-image-editor-container .tui-image-editor-submenu .tui-image-editor-button .color-picker-value {
        ${submenuColorpickerButton}
    }
    .tui-image-editor-container .svg_ic-menu {
        ${menuIconSize}
    }
    .tui-image-editor-container .svg_ic-submenu {
        ${submenuIconSize}
    }
    .tui-image-editor-container .tui-image-editor-controls-logo > img,
    .tui-image-editor-container .tui-image-editor-header-logo > img {
        ${biSize}
    }

`);
