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
    submenuRangeSubbar
}) => (`
    .tui-image-editor-container #icon-add-button.icon-bubble .button[data-icontype="icon-bubble"] label,
    .tui-image-editor-container #icon-add-button.icon-heart .button[data-icontype="icon-heart"] label,
    .tui-image-editor-container #icon-add-button.icon-location .button[data-icontype="icon-location"] label,
    .tui-image-editor-container #icon-add-button.icon-polygon .button[data-icontype="icon-polygon"] label,
    .tui-image-editor-container #icon-add-button.icon-star .button[data-icontype="icon-star"] label,
    .tui-image-editor-container #icon-add-button.icon-arrow-3 .button[data-icontype="icon-arrow-3"] label,
    .tui-image-editor-container #icon-add-button.icon-arrow-2 .button[data-icontype="icon-arrow-2"] label,
    .tui-image-editor-container #icon-add-button.icon-arrow .button[data-icontype="icon-arrow"] label,
    .tui-image-editor-container #icon-add-button.icon-bubble .button[data-icontype="icon-bubble"] label,
    .tui-image-editor-container #draw-line-select-button.line .button.line label,
    .tui-image-editor-container #draw-line-select-button.free .button.free label,
    .tui-image-editor-container #flip-button.flipX .button.flipX label,
    .tui-image-editor-container #flip-button.flipY .button.flipY label,
    .tui-image-editor-container #flip-button.resetFlip .button.resetFlip label,
    .tui-image-editor-container #crop-button .button.apply.active label,
    .tui-image-editor-container #shape-button.rect .button.rect label,
    .tui-image-editor-container #shape-button.circle .button.circle label,
    .tui-image-editor-container #shape-button.triangle .button.triangle label,
    .tui-image-editor-container #text-effect-button .button.active label,
    .tui-image-editor-container #text-align-button.left .button.left label,
    .tui-image-editor-container #text-align-button.center .button.center label,
    .tui-image-editor-container #text-align-button.right .button.right label,
    .tui-image-editor-container .tui-image-editor-submenu .button:hover > label,
    .tui-image-editor-container .tui-image-editor-checkbox input + label {
        ${subMenuLabelActive}
    }
    .tui-image-editor-container .tui-image-editor-submenu .button > label,
    .tui-image-editor-container .tui-image-editor-range-wrap.newline.short label {
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
    .tui-image-editor-container .tui-image-editor-virtual-range-pointer {
        ${submenuRangePointer}
    }
    .tui-image-editor-container .tui-image-editor-virtual-range-bar {
        ${submenuRangeBar}
    }
    .tui-image-editor-container .tui-image-editor-virtual-range-subbar {
        ${submenuRangeSubbar}
    }
    .tui-image-editor-container .tui-image-editor-range-value {
        ${submenuRangeValue}
    }
    .tui-image-editor-container .tui-image-editor-submenu .button .color-picker-value + label {
        ${submenuColorpickerTitle}
    }
    .tui-image-editor-container .tui-image-editor-submenu .button .color-picker-value {
        ${submenuColorpickerButton}
    }
`);
