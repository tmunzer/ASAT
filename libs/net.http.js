var http = require('http');
var net = require('net');
var url = require('url');

function HTTPTest(host, port, process, asatConsole, callback) {
    // make a request to a tunneling proxy
    var error = null;
    var ip = null;
    var options = {
        port: port,
        hostname: host,
        method: 'GET',
        path: "/",
        agent: false  // create a new agent just for this one request

    };
    asatConsole.error("test");
    var req = http.get(options, function (res){
        res.on('data', function (chunk) {
            asatConsole.log(chunk.toString());
        });
        res.on('end', function () {
            asatConsole.error('end');
            callback();
        });
        res.on('error', function (err) {
            asatConsole.error(err);
        });
    });

    req.on('connect', function (res, socket, head) {
        asatConsole.log('got connected!');

        // make a request over an HTTP tunnel




    });
    req.on('lookup', function (err, address) {
        if (err) {
            asatConsole.error("TCP " + process + " - " + host + " can't be resolved.");
            error = err;
            socket.end();
        }
        else if (address) {
            if (address != host) asatConsole.info("TCP " + process + " - " + host + " is resolved at " + address);
            ip = address;
        }
    });
    req.on('error', function (err) {
        asatConsole.error(err);
    });
    req.on('close', function(){
        asatConsole.error("close");
    })
}
