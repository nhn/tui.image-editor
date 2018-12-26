const fs = require('fs');
const mkdirp = require('mkdirp');
const svgstore = require('svgstore');
const svgDir = './src/svg';

function getFileList(dir) {
    const targetDir = `${svgDir}/${dir}`;
    const sprites = svgstore();
    fs.readdir(targetDir, (err, files) => {
        if (!files) return;
        files.forEach(file => {
            if (file.match(/^\./)) return;
            const id = `${dir}-${file.replace(/\.svg$/, '')}`;
            const svg = fs.readFileSync(`${targetDir}/${file}`);
            sprites.add(id, svg);
        });
        fs.writeFileSync(`./dist/svg/${dir}.svg`, sprites);
    });
}

mkdirp('./dist/svg', (mkdirpErr) => {
    if (mkdirpErr) {
        console.error(mkdirpErr);
    } else {
        fs.readdir(svgDir, (err, dirs) => {
            dirs.forEach(dir => {
                getFileList(dir);
            });
        });
    }
});
