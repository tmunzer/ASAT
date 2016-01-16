var https = require("https");
var http = require("http");
var dns = require("dns");

function HTTPSTest(host, port, process, asatConsole, proxy, callback) {
    var proxyOptions;
    if (proxy.configured){
        if (proxy.auth){
            var username = proxy.user;
            var password = proxy.password;
            var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');
            proxyOptions = { // establishing a tunnel
                host: proxy.host,
                port: proxy.port,
                method: 'CONNECT',
                path: host + ":" + port,
                headers: {
                    host: host,
                    "Proxy-Authorization" : auth
                }
            };
        } else {
            proxyOptions = { // establishing a tunnel
                host: proxy.host,
                port: proxy.port,
                method: 'CONNECT',
                path: host + ":" + port
            };
        }
    }

    var options = {
        host: host,
        method: 'GET',
        path: "https://" + host + "/",
        agent: false,  // create a new agent just for this one request
        shouldKeepAlive: false
    };


    dns.lookup(host, function (err, address) {
            if (err) {
                asatConsole.error("TCP " + process + " - " + host + " can't be resolved.");
                callback(true);
            }
            else if (address) {
                if (address != host) asatConsole.info("TCP " + process + " - " + host + " is resolved at " + address);
                if (proxy.configured) {

                    var proxyConn = http.request(proxyOptions, function(res){
                        var data = "";
                        res.setEncoding = 'utf8';
                        res.on('data', function(chunk) {
                            asatConsole.debug("TCP " + process + " - Getting data from server");
                            data += chunk;
                        }).on('end', function () {
                            if (httpCode.hasOwnProperty(res.statusCode.toString())) {
                                if (res.statusCode < 200 || res.statusCode >= 300) {
                                    asatConsole.error("TCP " + process + " - Got HTTP " + res.statusCode + "; " + httpCode[res.statusCode]);
                                } else {
                                    asatConsole.info("TCP " + process + " - Got HTTP " + res.statusCode + "; " + httpCode[res.statusCode]);
                                }
                            }
                        });
                    }).on('connect', function (res, socket) {
                        asatConsole.info("TCP " + process + " - Connected with Proxy server");

                        // should check res.statusCode here
                        options = {
                            host: host,
                            socket: socket,
                            path: "https://" + host + "/",
                            agent: false  // create a new agent just for this one request
                        };
                        httpsRequest(address, function (error) {
                            callback(error);
                        });
                    }).on('error', function (e) {
                        asatConsole.error("TCP " + process + " - Error while connecting to proxy" );
                        asatConsole.error("TCP " + process + " - Connection to " + host + ":" + port + " failed");
                        callback(true);
                    }).end();
                } else {
                    httpsRequest(address, function (error) {
                        callback(error);
                    });
                }

            }
        }
    );

    function httpsRequest(address, callback) {
        var error = null;
        var data = null;

        asatConsole.debug('TCP ' + process + ' - Trying to establish a connection to ' + address + ':' + port);

        var req = https.get(options, function (res) {
            res.on('data', function (chunk) {
                if (data == null) asatConsole.debug("TCP " + process + " - Getting data from server");
                data += chunk;
            });
            res.on('end', function () {
                if (httpCode.hasOwnProperty(res.statusCode.toString())) {
                    if (res.statusCode < 200 || res.statusCode >= 400) {
                        error = "warning";
                        asatConsole.warning("TCP " + process + " - Got HTTP " + res.statusCode + "; " + httpCode[res.statusCode]);
                    } else {
                        asatConsole.info("TCP " + process + " - Got HTTP " + res.statusCode + "; " + httpCode[res.statusCode]);
                    }
                }
            });
        });
        req.on('error', function (err) {
            if (err.message != "socket hang up" && err.message != "write EPROTO") {
                error = true;
                asatConsole.error("TCP " + process + " - " + err);
            }
            req.end();
        }).on('close', function () {
            if (error) asatConsole.error("TCP " + process + " - Connection to " + host + ":" + port + " failed");
            else asatConsole.info('TCP ' + process + ' - Connection established to ' + host + ':' + port);
            callback(error);
        });
    }

}


