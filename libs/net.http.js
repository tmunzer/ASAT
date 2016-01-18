function HTTPTest(host, port, process, asatConsole, proxy,  callback) {
    var http = require('http');
    var dns = require("dns");

    var retry = 0;
    var maxRetry = 1;

    var data = "";
    var httpResult ={error: null, warning: null, success: null};

    // make a request to a tunneling proxy
    var options;
    if (proxy.configured){
        if (proxy.auth){
            var username = proxy.user;
            var password = proxy.password;
            var auth = 'Basic ' + new Buffer(username + ':' + password).toString('base64');

            options = {
                port: proxy.port,
                hostname: proxy.host,
                method: 'GET',
                path: "http://" + host + "/",
                agent: false,  // create a new agent just for this one request
                shouldKeepAlive: false,
                headers: {
                    host: host,
                    "Proxy-Authorization" : auth
                }
            };
        } else {
            options = {
                port: proxy.port,
                hostname: proxy.host,
                method: 'GET',
                path: "http://" + host + "/",
                agent: false,  // create a new agent just for this one request
                shouldKeepAlive: false
            };
        }


    } else {
        options = {
            port: port,
            hostname: host,
            method: 'GET',
            path: "http://" + host + "/",
            agent: false,  // create a new agent just for this one request
            shouldKeepAlive: false
        };
    }

    asatConsole.info("TCP " + process + " - Test for " + host + ":" + port);
    runHttpTest(function queueCallback(error, warning, success){
        if (error && retry < maxRetry){
            retry ++;
            asatConsole.warning("TCP " + process + " - Retry  for " + host + ":" + port);
            runHttpTest(queueCallback)
        } else callback(error, warning, success);
    });



    function runHttpTest(httpCallback){

        dns.lookup(host, function(err, address){
            if (err) {
                asatConsole.error("TCP " + process + " - " + host + " can't be resolved.");
                httpCallback(err);
            }
            else if (address) {
                if (address != host) asatConsole.info("TCP " + process + " - " + host + " is resolved at " + address);

                asatConsole.debug('TCP ' + process + ' - Trying to establish a connection to ' + address + ':' + port);

                var req = http.get(options, function(res){
                    res.on('data', function(chunk){
                        if (data == null) asatConsole.debug("TCP " + process + " - Getting data from server");
                        data += chunk;
                    });
                    res.on('end', function(){
                        httpResult = getHttpCode(res, process);
                    });
                });

                req.on('error', function (err) {
                    if (err.message != "socket hang up" && err.message != "write EPROTO"){
                        httpResult.error = err;
                        asatConsole.error("TCP " + process + " - " + err);
                    }
                    req.end();
                });

                req.on('close', function () {
                    if (httpResult.error) asatConsole.error("TCP " + process + " - Connection to " + host + ":" + port + " failed");
                    else asatConsole.info('TCP ' + process + ' - Connection established to ' + host + ':' + port);
                    httpCallback(httpResult.error, httpResult.warning, httpResult.success);
                });

            }
        });
    }
}



