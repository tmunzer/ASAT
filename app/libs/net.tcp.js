function TCPTest(host, port, process, asatConsole, callback) {
    var net = require('net');

    var ip = "";
    var error = null;
    var warning = null;
    var success = null;

    var retry = 0;
    var maxRetry = 1;

    asatConsole.info("TCP " + process + " - Test for " + host + ":" + port);
    runTcpTest(function queueCallback(error, warning, success) {
        if (error && retry < maxRetry) {
            retry++;
            asatConsole.warning("TCP " + process + " - Retry  for " + host + ":" + port);
            runTcpTest(queueCallback)
        } else callback(error, warning, success);
    });

    function runTcpTest(tcpCallback) {
         var client = new net.Socket();

        client.on('data', function (data) {
            asatConsole.debug('TCP ' + process + ' - received message from server: ' + data.toString());
            success = "Received data from server";
            client.end();
        });

        client.on('end', function () {
            asatConsole.debug('TCP ' + process + ' - Disconnected from server ' + host + ":" + port);
        });
        client.on('close', function () {
            if (error) asatConsole.error("TCP " + process + " - Connection to " + host + ":" + port + " failed");
            else asatConsole.info('TCP ' + process + ' - Connection established to ' + host + ':' + port);

            client.destroy();
            asatConsole.debug("TCP " + process + " - Socket destroyed for server " + host + ":" + port);
            tcpCallback(error, warning, success);
        });
        client.on("error", function (err) {
            error = err;
            asatConsole.debug("TCP " + process + " - " + err);
            client.end();
        });

        client.on('lookup', function (err, address) {
            if (err) {
                asatConsole.error("TCP " + process + " - " + host + " can't be resolved.");
                error = err;
                client.end();
            }
            else if (address) {
                if (address != host) asatConsole.info("TCP " + process + " - " + host + " is resolved at " + address);
                ip = address;
            }
        });

        client.connect(port, host, function () { //'connect' listener
            asatConsole.debug('TCP ' + process + ' - Trying to establish a connection to ' + ip + ':' + port);
            client.write("Hello Server\r\n");
            setTimeout(function () {
                if (!client) {
                    asatConsole.error("TCP " + process + " - Request to " + host + " timed out");
                    client.close();
                }
            }, 5000);
        });
    }
}

