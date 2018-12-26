// Type definitions for TOAST UI Image Editor v3.3.0
// TypeScript Version: 3.2.2

type jQueryObj = any;
type PromiseObj = Promise<any>;
type FileObj = any;

interface ThemeConfig {
    'common.bi.image'?: string;
    'common.bisize.width'?: string;
    'common.bisize.height'?: string;
    'common.backgroundImage'?: string;
    'common.backgroundColor'?: string;
    'common.border'?: string;
    'header.backgroundImage'?: string;
    'header.backgroundColor'?: string;
    'header.border'?: string;
    'loadButton.backgroundColor'?: string;
    'loadButton.border'?: string;
    'loadButton.color'?: string;
    'loadButton.fontFamily'?: string;
    'loadButton.fontSize'?: string;
    'downloadButton.backgroundColor'?: string;
    'downloadButton.border'?: string;
    'downloadButton.color'?: string;
    'downloadButton.fontFamily'?: string;
    'downloadButton.fontSize'?: string;
    'menu.normalIcon.path'?: string;
    'menu.normalIcon.name'?: string;
    'menu.activeIcon.path'?: string;
    'menu.activeIcon.name'?: string;
    'menu.iconSize.width'?: string;
    'menu.iconSize.height'?: string;
    'submenu.backgroundColor'?: string;
    'submenu.partition.color'?: string;
    'submenu.normalIcon.path'?: string;
    'submenu.normalIcon.name'?: string;
    'submenu.activeIcon.path'?: string;
    'submenu.activeIcon.name'?: string;
    'submenu.iconSize.width'?: string;
    'submenu.iconSize.height'?: string;
    'submenu.normalLabel.color'?: string;
    'submenu.normalLabel.fontWeight'?: string;
    'submenu.activeLabel.color'?: string;
    'submenu.activeLabel.fontWeight'?: string;
    'checkbox.border'?: string;
    'checkbox.backgroundColor'?: string;
    'range.pointer.color'?: string;
    'range.bar.color'?: string;
    'range.subbar.color'?: string;
    'range.value.color'?: string;
    'range.value.fontWeight'?: string;
    'range.value.fontSize'?: string;
    'range.value.border'?: string;
    'range.value.backgroundColor'?: string;
    'range.title.color'?: string;
    'range.title.fontWeight'?: string;
    'colorpicker.button.border'?: string;
    'colorpicker.title.color'?: string;
}

interface IconOptions {
    fill?: string;
    left?: number;
    top?: number;
}

interface ShapeOptions {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    width?: number;
    height?: number;
    rx?: number;
    ry?: number;
    left?: number;
    top?: number;
    isRegular?: boolean;
}

interface GenerateTextOptions {
    styles?: TextStyleConfig;
    position?: {
        x: number;
        y: number;
    };
}

interface TextStyleConfig {
    fill?: string;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
    fontWeight?: string;
    textAlign?: string;
    textDecoration?: string;
}

interface RectConfig {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface CanvasSize {
    width: number;
    height: number;
}

interface BrushOptions {
    width: number;
    color: string;
}

interface PositionConfig {
    x: number;
    y: number;
    originX: string;
    originY: string;
}

interface ToDataURLOptions {
    format?: string;
    quality?: number;
    multiplier?: number;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
}

interface GraphicObjectProps {
    id?: number;
    type?: string;
    text?: string;
    left?: string | number;
    top?: string | number;
    width?: string | number;
    height?: string | number;
    fill?: string;
    stroke?: string;
    strokeWidth?: string | number;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
    fontWeight?: string;
    textAlign?: string;
    textDecoration?: string;
    opacity?: number;
}

interface IncludeUIOptions {
    loadImage?: {
        path: string;
        name: string;
    };
    theme?: ThemeConfig;
    menu?: string[];
    initMenu?: string;
    uiSize?: {
        width: string;
        height: string;
    };
    menuBarPosition?: string;
}

interface SelectionStyleConfig {
    cornerStyle?: string;
    cornerSize?: number;
    cornerColor?: string;
    cornerStrokeColor?: string;
    transparentCorners?: boolean;
    lineWidth?: number;
    borderColor?: string;
    rotatingPointOffset?: number;
}

interface Options {
    includeUI?: IncludeUIOptions;
    cssMaxWidth?: number;
    cssMaxHeight?: number;
    usageStatistics?: boolean;
    selectionStyle?: SelectionStyleConfig;
}

declare class ImageEditor {
    constructor(wrapper: string | jQueryObj | Element, options: Options);

    addIcon(type: string, options?: IconOptions): PromiseObj;
    addImageObject(imgUrl: string): PromiseObj;
    addShape(type: string, options?: ShapeOptions): PromiseObj;
    addText(text: string, options?: GenerateTextOptions): PromiseObj;
    applyFilter(type: string, options?: {
        maskObjId: number
    }): PromiseObj;
    changeCursor(cursorType: string): void;
    changeIconColor(id: number, color: string): PromiseObj;
    changeSelectableAll(selectable: boolean): void;
    changeShape(id: number, options?: ShapeOptions): PromiseObj;
    changeText(id: number, text?: string): PromiseObj;
    changeTextStyle(id: number, styleObj: TextStyleConfig): PromiseObj;
    clearObjects(): PromiseObj;
    clearRedoStack(): void;
    clearUndoStack(): void;
    crop(rect: RectConfig): PromiseObj;
    deactivateAll(): void;
    destroy(): void;
    discardSelection(): void;
    flipX(): PromiseObj;
    flipY(): PromiseObj;
    getCanvasSize(): CanvasSize;
    getCropzoneRect(): RectConfig;
    getDrawingMode(): string;
    getImageName(): string;
    getObjectPosition(id: number, originX: string, originY: string): CanvasSize;
    getObjectProperties(id: number, keys: string[] | string | any): any;
    hasFilter(type: string): boolean;
    isEmptyRedoStack(): boolean;
    isEmptyUndoStack(): boolean;
    loadImageFromFile(imgFile: FileObj, imageName?: string): PromiseObj;
    loadImageFromURL(url: string, imageName?: string): PromiseObj;
    redo(): PromiseObj;
    registerIcons(infos: any): void;
    removeActiveObject(): void;
    removeFilter(type?: string): PromiseObj;
    removeObject(id: number): PromiseObj;
    resetFlip(): PromiseObj;
    resizeCanvasDemension(dimension: CanvasSize): PromiseObj; // 파라미터 확인 필요
    rotate(angle: number): PromiseObj;
    setAngle(angle: number): PromiseObj;
    setBrush(option: BrushOptions): void;
    setCropzoneRect(mode?: number): void;
    setDrawingShape(type: string, options?: ShapeOptions): void;
    setObjectPosition(id: number, posInfo?: PositionConfig): PromiseObj;
    setObjectProperties(id: number, keyValue?: GraphicObjectProps): PromiseObj;
    setObjectPropertiesQuietly(id: number, keyValue?: GraphicObjectProps): PromiseObj;
    startDrawingMode(mode: string, option?: {width?: number, color?: string}): boolean;
    stopDrawingMode(): void;
    toDataURL(options?: ToDataURLOptions): string;
    undo(): PromiseObj;
    on(eventName: string, handler: (...args: any[]) => any): any;
}

declare module 'tui-image-editor' {
    export = ImageEditor;
}
