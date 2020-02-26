export const controls = ({locale, biImage, loadButtonStyle, downloadButtonStyle}) => (`
    <div class="tui-image-editor-controls">
        <div class="tui-image-editor-controls-logo">
            <img src="${biImage}" />
        </div>
        <ul class="tui-image-editor-menu"></ul>

        <div class="tui-image-editor-controls-buttons">
            <div style="${loadButtonStyle}">
                ${locale.localize('Load')}
                <input type="file" class="tui-image-editor-load-btn" />
            </div>
            <button class="tui-image-editor-download-btn" style="${downloadButtonStyle}">
                ${locale.localize('Download')}
            </button>
        </div>
    </div>
`);

export const partition = () => (`
    <li class="tui-image-editor-item">
        <div class="tui-image-editor-icpartition"></div>
    </li>
`);
