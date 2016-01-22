
var SSH = require("./net.ssh");
var Netmask = require("netmask").Netmask;

var discoverMessenger;
var deviceCount;
var deviceNumber;

module.exports.discover = function(cidr, credentials, threads, asatConsole, messenger, callback){
    var block = new Netmask(cidr);
    deviceCount = block.size;
    deviceNumber = 1;
    discoverMessenger = messenger;
    discoverMessenger.emit("update", deviceNumber, deviceCount);
    var stop = false;

    var deviceIp = block.first;
    asatConsole.info("Disovering network " + cidr);

    for (var i = 0; i < threads; i ++){
        if (block.contains(deviceIp)) {
            discoverDevice(deviceIp, credentials, asatConsole, callback);
            deviceIp = nextIP(deviceIp);
        }
    }

    discoverMessenger.on("nextIP", function(){
        console.log('next');
        if (block.contains(deviceIp) && !stop) {
            discoverDevice(deviceIp, credentials, asatConsole, callback);
            deviceIp = nextIP(deviceIp);
        }

    }).on('stop', function(){
        stop = true;
    })
};

function discoverDevice(deviceIP, credentials, asatConsole, callback){
    if (deviceIP){
        asatConsole.debug('Testing IP Address ' + deviceIP);
        console.log('Testing IP Address ' + deviceIP);
        SSH.connectDevice(deviceIP, credentials, ["sh hw"], asatConsole, function(err, data){
            discoverMessenger.emit("update", deviceNumber, deviceCount);
            discoverMessenger.emit("nextIP", data);
            if (err) callback(err);
            else getInfo(data);
        });
    }
}

function getInfo(data){
    console.log(data);
}



function nextIP(ip){
    var ipSplitted = ip.split('.');
    if (ipSplitted[3] < 255) ipSplitted[3] ++;
    else {
        ipSplitted[3] = 0;
        if (ipSplitted[2] < 255) ipSplitted[2] ++;
        else {
            ipSplitted[2] = 0;
            if (ipSplitted[1] < 255) ipSplitted[1] ++;
            else {
                ipSplitted[1] = 0;
                if (ipSplitted[0] < 255) ipSplitted[0] ++;
                else {
                    return false
                }
            }
        }
    }

    deviceNumber ++;
    return ipSplitted[0]+"."+ipSplitted[1]+"."+ipSplitted[2]+"."+ipSplitted[3];
}