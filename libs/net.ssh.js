var Client = require('ssh2').Client;

module.exports.connectDevice = function (ip, credentials, commands, asatConsole, callback) {
    var conn = new Client();
    var error = false;
    var warning = false;
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
        if (err.level == "client-timeout") {
            error = ip + ": timeout";
            asatConsole.debug(error);
        }
        else if (err.level == "client-authentication") {
            warning = ip + ": authentication failed";
            asatConsole.error(warning);
        }
        else if (err.level == "client-socket"){
            error = ip + ": connection refused";
            asatConsole.error(error);
        } else {
            error = ip + ": " + err.message;
            asatConsole.error(error);
        }
        callback(error, warning, stdout);
    }).on("end", function () {
        if (error == false && warning == false) callback(error, warning, stdout);
    }).connect({
        host: ip,
        port: 22,
        username: credentials.login,
        password: credentials.password,
        readyTimeout: 1000
    });
};