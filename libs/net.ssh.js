var Client = require('ssh2').Client;

module.exports.connectDevice = function (ip, credentialas, commands, asatConsole, callback) {
    var conn = new Client();
    var error = false;
    var stdout = "";
    var i = 0;

    conn.on('ready', function () {
        console.log('Client :: ready');
        conn.shell(function (err, stream) {
            if (err) {
                asatConsole.error(err.message);
                error = err.message;
                conn.end();
            }
            stream.on('close', function (code, signal) {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                conn.end();
            }).on('data', function (data) {
                console.log('STDOUT: ' + data);
                stdout += data;
                if (data.toString().indexOf("#") >= 0) {
                    if (i < commands.length) {
                        stream.write(commands[i] + "\n");
                        i++;
                    } else stream.write("exit\n");
                } else if (data.toString().indexOf("--More--") >= 0) stream.write(" ");
                else if (data.toString().indexOf("Y/N") >= 0) stream.write("Y\n");
            }).stderr.on('data', function (data) {
                    console.log('STDERR: ' + data);
                });
        });
    }).on("error", function (err) {
        asatConsole.debug(err.message);
        callback(err.message, stdout);
    }).on("end", function () {
        callback(error, stdout);
    }).connect({
        host: ip,
        port: 22,
        username: credentialas.login,
        password: credentialas.password,
        readyTimeout: 500
    });
};