
function UDPTest(host, port, process, asatConsole, callback){
    var dgram = require('dgram');
    var client = dgram.createSocket("udp4");
    var message = "70408000000000000000012c040045000009f61900001f4000380000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    var hexMessage = new Buffer(message, 'hex');
    var socketClosed = false;
    var error = null;

    var retry = 0;
    var maxRetry = 1;

    asatConsole.info("UDP " + process + " - Test for " + host + ":" + port);
    runUdpTest(function queueCallback(error, warning){
        if (error && retry < maxRetry){
            retry ++;
            asatConsole.warning("UDP " + process + " - Retry  for " + host + ":" + port);
            runUdpTest(queueCallback)
        } else callback(error, warning);
    });


    function runUdpTest(udpCallback){
    client.on("close", function(err){
        socketClosed = true;
        if (err) error = err;
        asatConsole.debug("UDP " + process + " - Socket closed");
        udpCallback(error);
    });
    client.on('message', function(msg, rinfo) {
        asatConsole.info("UDP " + process + " - CAPWAP ECHO REPLY received from  " + rinfo.address + ":" + rinfo.port);
        client.close();
    });
    client.on('error', function(err){
        asatConsole.error("UDP " + process + " - " + err);
        error = err;
        client.close();
    });
    client.on('lookup', function (err, address) {
        if (err) {
            asatConsole.error("UDP " + process + " - " + host + " can't be resolved.");
            error = err;
            client.end();
        }
        else if (address) {
            if (address != host) asatConsole.info("UDP " + process + " - " + host + " is resolved at " + address);
        }
    });
    client.send(hexMessage, 0, hexMessage.length, port, host, function() {
            asatConsole.info("UDP " + process + " - CAPWAP ECHO REQUEST sent to " + host + ":" + port);
            setTimeout(function(){
                if (!socketClosed){
                    error = "timeout";
                    asatConsole.error("UDP " + process + " - Request to " + host + " timed out");
                    client.close();
                }
            }, 5000);
    });
    }
}
