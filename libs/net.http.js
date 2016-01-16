function HTTPTest(host, port, process, asatConsole, proxy,  callback) {
    var http = require('http');
    var dns = require("dns");
    // make a request to a tunneling proxy
    var data = "";
    var error = null;
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

    dns.lookup(host, function(err, address){
        if (err) {
            asatConsole.error("TCP " + process + " - " + host + " can't be resolved.");
            callback(true);
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
                    if (httpCode.hasOwnProperty(res.statusCode.toString())){
                        if (res.statusCode < 200 || res.statusCode >= 400){
                            error = "warning";
                            asatConsole.warning("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
                        } else {
                            asatConsole.info("TCP " + process + " - Got HTTP " + res.statusCode + ": " + httpCode[res.statusCode]);
                        }
                    }
                });
            });

            req.on('error', function (err) {
                if (err.message != "socket hang up" && err.message != "write EPROTO"){
                    error = true;
                    asatConsole.error("TCP " + process + " - " + err);
                }
                req.end();
            });

            req.on('close', function () {
                if (error) asatConsole.error("TCP " + process + " - Connection to " + host + ":" + port + " failed");
                else asatConsole.info('TCP ' + process + ' - Connection established to ' + host + ':' + port);
                callback(error);
            });

        }
    });
}


