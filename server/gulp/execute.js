const proc = require('child_process');

const execute = (cb, command) => {
    const cmd = command.split(' ');

    const process = proc.spawn(cmd[0], cmd.slice(1, cmd.length));

    process.stderr.setEncoding('utf8');

    let error = '';

    process.stderr.on('data', data => {
        console.log(data);
        error += data.toString();
    });

    process.stdout.on('data', data => console.log(data.toString()));

    process.on('exit', code => {
        if (code > 0) {
            cb(code);
        } else {
            cb();
        }
    });
};

module.exports = execute