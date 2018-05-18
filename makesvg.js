const fs = require('fs');
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
        fs.writeFileSync(`./dist/${dir}.svg`, sprites);
    });
}

fs.readdir('./src/svg', (err, dirs) => {
    dirs.forEach(dir => {
        getFileList(dir);
    });
})

