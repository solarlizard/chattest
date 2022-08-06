const fs = require('fs');

//const packageJson = JSON.parse(fs.readFileSync('package.json'));


const generatePackageJson = (cb) => {

    Promise.all ([
        fs.promises.copyFile ("./yarn.lock", "./build/dist/yarn.lock"),
        fs.promises.readFile ("./package.json")
            .then (buffer => JSON.parse (buffer))
            .then (packageJson => fs.promises.writeFile ("./build/dist/package.json", JSON.stringify({
                name: packageJson.name,
                version: packageJson.version,
                dependencies : packageJson.dependencies
            }, null, 4), null))
        ])
        .then (() => cb ())
        .catch (cb)
};

module.exports = generatePackageJson