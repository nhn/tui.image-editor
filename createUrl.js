const fs = require("fs");
const path = require("path");
const config = require(path.resolve(process.cwd(), "tuidoc.config.json"));
const examples = config.examples || {};
const { filePath = "" } = examples;

/**
 * Get Examples Url
 */
function getTestUrls() {
    if (!filePath) {
        throw Error("not exist examples path at tuidoc.config.json");
    }

    const urlPrefix = "http://nhn.github.io/tui.image-editor/latest";

    const testUrls = fs.readdirSync(filePath).reduce((urls, fileName) => {
        if (/html$/.test(fileName)) {
            urls.push(`${urlPrefix}/${filePath}/${fileName}`);
        }
        return urls;
    }, []);

    const result = testUrls.join(", ");

    fs.writeFileSync("url.txt", result);

    return result;
}

getTestUrls();
