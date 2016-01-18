var https = require("https");
var http = require("http");
var dns = require("dns");

function HTTPSTest(host, port, process, asatConsole, proxy, callback) {
    var proxyOptions;
    var proxyRetry = 0;
    var httpsRetry = 0;
    var maxRetry = 1;

    // configure the HTTP option to connect to the proxy server
    if (proxy.configured) {
        if (proxy.auth) {
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
                    "Proxy-Authorization": auth
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
                    proxyConnection(address, function queueCallbackProxy(error, warning, success) {
                        if (error && proxyRetry < maxRetry) {
                            proxyRetry++;
                            asatConsole.warning("TCP " + process + " - Retry proxy connection to " + proxy.host + ":" + proxy.port);
                            proxyConnection(address, queueCallbackProxy)
                        } else callback(error, warning, success);
                    });
                    // Otherwise (no proxy configured), try the HTTPS connection directly
                } else {
                    asatConsole.info("TCP " + process + " - Test for " + host + ":" + port);
                    runHttpsRequest(address, httpsOptions, function queueCallbackHttps(error, warning, success) {
                        if (error && httpsRetry < maxRetry) {
                            httpsRetry++;
                            asatConsole.warning("TCP " + process + " - Retry  for " + host + ":" + port);
                            runHttpsRequest(address, httpsOptions, queueCallbackHttps)
                        } else callback(error, warning, success);
                    });
                }
            }
        }
    );

    function proxyConnection(address, proxyCallback) {
        var httpResult = {error: null, warning: null, success: null};
        var data = "";

        http.request(proxyOptions, function (res) {
            res.setEncoding = 'utf8';
            console.log(res);
            res.on('data', function (chunk) {
                data += chunk;
            }).on("end", function () {
                httpResult = getHttpCode(res, process);
            });
        }).on('connect', function (res, socket) {
            http.log(res);
            httpResult = getHttpCode(res, process);
            if (httpResult.success) {
                asatConsole.info("TCP " + process + " - Connected with Proxy server");
                httpsOptions = {
                    host: host,
                    socket: socket,
                    path: "https://" + host + "/",
                    agent: false  // create a new agent just for this one request
                };
                asatConsole.info("TCP " + process + " - Test for " + host + ":" + port);
                runHttpsRequest(address, httpsOptions, function queueCallbackHttpsWithProxy(httpsError, httpsWarning, httpsSuccess) {
                    if (httpsError && httpsRetry < maxRetry) {
                        httpsRetry++;
                        asatConsole.warning("TCP " + process + " - Retry  for " + host + ":" + port);
                        runHttpsRequest(address, httpsOptions, queueCallbackHttpsWithProxy)
                    } else proxyCallback(httpsError, httpsWarning, httpsSuccess);
                });
            }
        }).on('error', function (err) {
            httpResult.error = "Connexion to proxy failed";
            asatConsole.error("TCP " + process + " - Error while connecting to proxy");
        }).on('close', function () {
            if (httpResult.error) {
                asatConsole.error("TCP " + process + " - Connection to Proxy " + proxy.host + ":" + proxy.port + " failed");
                proxyCallback(httpResult.error, httpResult.warning, httpResult.success);
            }
        }).end();

    }


    function runHttpsRequest(address, options, httpsCallback) {
        var httpsResult = {error: null, warning: null, success: null};
        var data = "";

        asatConsole.debug('TCP ' + process + ' - Trying to establish a connection to ' + address + ':' + port);

        var req = https.get(options, function (res) {
            res.on('data', function (chunk) {
                if (data == null) asatConsole.debug("TCP " + process + " - Getting data from server");
                data += chunk;
            });
            res.on('end', function () {
                httpsResult = getHttpCode(res, process);
            });
        });
        req.on('error', function (err) {
            if (err.message != "socket hang up" && err.message != "write EPROTO") {
                httpsResult.error = err;
                asatConsole.error("TCP " + process + " - " + err);
            }
            req.end();
        }).on('close', function () {
            if (httpsResult.error) asatConsole.error("TCP " + process + " - Connection to " + host + ":" + port + " failed");
            else asatConsole.info('TCP ' + process + ' - Connection established to ' + host + ':' + port);
            console.log(httpsResult);
            httpsCallback(httpsResult.error, httpsResult.warning, httpsResult.success);
        });
    }

}


