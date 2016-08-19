var markup = String($('.wrap').html());
$(document).ready(function() {
    var source,
        i,
        lineId,
        lines,
        totalLines,
        anchorHash,
        sourceHTML;
    initCode();
    source = $('.sourceCode .source');
    sourceHTML = $('.sourceHtml .source');
    source.html(htmlsafe(String($('.serviceCode').html())));
    sourceHTML.html(htmlsafe(markup));
    prettyPrint();
    if (source && source[0]) {
        anchorHash = document.location.hash.substring(1);
        lines = source[0].getElementsByTagName('li');
        totalLines = lines.length;
        i = 0;
        for (; i < totalLines; i++) {
            lineId = 'line' + i;
            lines[i].id = lineId;
            if (lineId === anchorHash) {
                lines[i].className += ' selected';
            }
        }
    }
});

function initCode() {
    var initCode = '<h2 class="title">HTML</h2>\
    <div class="sourceHtml">\
        <pre class="prettyprint source linenums"><code></code></pre>\
    </div>\
    <h2 class="title">Javascript</h2>\
    <div class="sourceCode">\
        <pre class="prettyprint source linenums"><code></code></pre>\
    </div>',
        initWrapper = $('.codeArea');
    initWrapper.html(initCode);
}

/**
 * Make a element to display line number
 * @param {number} num
 */
function getNumberElement(num) {
    var span = document.createElement('span');
    span.className = 'number';
    span.style.display = "inline-block";
    span.style.color = "#666";
    span.style.width = "40px";
    span.innerHTML = num + ' : ';
    return span;
}

function htmlsafe(str) {
    if (typeof str !== 'string') {
        str = String(str);
    }

    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;');
};