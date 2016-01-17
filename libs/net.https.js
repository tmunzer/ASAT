var https = require("https");
var http = require("http");
var dns = require("dns");

function HTTPSTest(host, port, process, asatConsole, proxy, callback) {
    var proxyOptions;
    var proxyRetry = 0;
    var httpsRetry = 0;
    var maxRetry = 1;

    // configure the HTTP option to connect to the proxy server
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

    // configure the HTTPS options to connect to the server
    var httpsOptions = {
        host: host,
        method: 'GET',
        path: "https://" + host + "/",
        agent: false,  // create a new agent just for this one request
        shouldKeepAlive: false
    };

    // veryfy the DNS Lookup
    dns.lookup(host, function (err, address) {
            if (err) {
                asatConsole.error("TCP " + process + " - " + host + " can't be resolved.");
                callback(err);
            }
            // If DNS Lookup is Ok
            else if (address) {
                if (address != host) asatConsole.info("TCP " + process + " - " + host + " is resolved at " + address);

                // If proxy is configured, try firstly to connect to the Proxy
                if (proxy.configured) {
                    asatConsole.info("TCP " + process + " - Proxy connection to " + proxy.host + ":" + proxy.port);

                    proxyConnection(address, function queueCallbackProxy(err, warn){
                        if (err && proxyRetry < maxRetry){
                            proxyRetry ++;
                            asatConsole.warning("TCP " + process + " - Retry proxy connection to " + proxy.host + ":" + proxy.port);
                            proxyConnection(address, queueCallbackProxy)
                        } else callback(err, warn);
                    });
                // Otherwise (no proxy configured), try the HTTPS connection directly
                } else {
                    asatConsole.info("TCP " + process + " - Test for " + host + ":" + port);
                    runHttpsRequest(address, httpsOptions, function queueCallbackHttps(error, warning){
                        if (error && httpsRetry < maxRetry){
                            httpsRetry ++;
                            asatConsole.warning("TCP " + process + " - Retry  for " + host + ":" + port);
                            runHttpsRequest(address, httpsOptions, queueCallbackHttps)
                        } else callback(error, warning);
                    });
                }
            }
        }
    );

    function proxyConnection(address, proxyCallback){
        var error = null;
        var warning = null;

        http.request(proxyOptions, function(res){
            var data = "";
            res.setEncoding = 'utf8';
            res.on('data', function(chunk) {
                asatConsole.debug("TCP " + process + " - Getting data from server");
                data += chunk;
            }).on('end', function () {
                if (httpCode.hasOwnProperty(res.statusCode.toString())) {
                    if (res.statusCode >= 400 && res.statusCode < 500) {
                        error = "Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode];
                        asatConsole.error("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
                    } else if (res.statusCode < 200 || res.statusCode >= 300) {
                        warning = "Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode];
                        asatConsole.warning("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
                    } else {
                        asatConsole.info("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
                    }
                }
            });
        }).on('connect', function (res, socket) {
            asatConsole.info("TCP " + process + " - Connected with Proxy server");

            // should check res.statusCode here
            httpsOptions = {
                host: host,
                socket: socket,
                path: "https://" + host + "/",
                agent: false  // create a new agent just for this one request
            };
            asatConsole.info("TCP " + process + " - Test for " + host + ":" + port);
            runHttpsRequest(address, httpsOptions, function queueCallbackHttpsWithProxy(err, warn){
                error = err;
                warning = warn;
                if (error && httpsRetry < maxRetry){
                    httpsRetry ++;
                    asatConsole.warning("TCP " + process + " - Retry  for " + host + ":" + port);
                    runHttpsRequest(address, httpsOptions, queueCallbackHttpsWithProxy)
                } else proxyCallback(error, warning);
            });
        }).on('error', function (err) {
            error = err;
            asatConsole.error("TCP " + process + " - Error while connecting to proxy" );
            asatConsole.error("TCP " + process + " - Connection to " + host + ":" + port + " failed");
        }).on('close', function () {
            if (error) {
                asatConsole.error("TCP " + process + " - Connection to Proxy " + proxy.host + ":" + proxy.port + " failed");
                proxyCallback(error, warning);
            }
        }).end();

    }


    function runHttpsRequest(address, options, httpsCallback) {
        var error = null;
        var warning = null;
        var data = null;

        asatConsole.debug('TCP ' + process + ' - Trying to establish a connection to ' + address + ':' + port);

        var req = https.get(options, function (res) {
            res.on('data', function (chunk) {
                if (data == null) asatConsole.debug("TCP " + process + " - Getting data from server");
                data += chunk;
            });
            res.on('end', function () {
                if (httpCode.hasOwnProperty(res.statusCode.toString())) {
                    if (httpCode.hasOwnProperty(res.statusCode.toString())) {
                        if (res.statusCode >= 400 && res.statusCode < 500) {
                            error = "Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode];
                            asatConsole.error("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
                        } else if (res.statusCode < 200 || res.statusCode >= 300) {
                            warning = "Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode];
                            asatConsole.warning("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
                        } else {
                            asatConsole.info("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
                        }
                    }
                }
            });
        });
        req.on('error', function (err) {
            if (err.message != "socket hang up" && err.message != "write EPROTO") {
                error = err;
                asatConsole.error("TCP " + process + " - " + err);
            }
            req.end();
        }).on('close', function () {
            if (error) asatConsole.error("TCP " + process + " - Connection to " + host + ":" + port + " failed");
            else asatConsole.info('TCP ' + process + ' - Connection established to ' + host + ':' + port);
            httpsCallback(error, warning);
        });
    }

}


