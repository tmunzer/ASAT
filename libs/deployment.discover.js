
var SSH = require("./net.ssh");
var Netmask = require("netmask").Netmask;
var Device = require('./aerohive.device');
var discoverMessenger;
var deviceCount;
var asatConsole;

module.exports.discover = function(discoverProcess, cidr, credentials, threads, myConsole, messenger){
    var block = new Netmask(cidr);
    discoverMessenger = messenger;
    deviceCount = block.size - 2;
    asatConsole = myConsole;
    var runningProcess = 0;
    var stop = false;

    var deviceIp = block.first;
    asatConsole.info("Disovering network " + cidr);
    discoverMessenger.emit("deployment discover start", discoverProcess, deviceCount);
    for (var i = 0; i < threads; i ++){
        if (block.contains(deviceIp)) {
            runningProcess ++;
            discoverDevice(discoverProcess, deviceIp, credentials);
            deviceIp = nextIP(deviceIp);
        }
    }

    discoverMessenger.on("deployment discover nextIP", function(process){
        if (discoverProcess == process){
            runningProcess --;
            if (block.contains(deviceIp) && !stop && deviceIp != block.broadcast) {
                runningProcess ++;
                discoverDevice(discoverProcess, deviceIp, credentials);
                deviceIp = nextIP(deviceIp);
            } else if (runningProcess == 0){
                discoverMessenger.emit("deployment discover end", process);
            }
        }
    }).on('deployment discover stop', function(){
        stop = true;
    })
};

function discoverDevice(discoverProcess, deviceIP, credentials){
    if (deviceIP){
        SSH.connectDevice(deviceIP, credentials, ["sh hw"], asatConsole, function(err, warn, data){
            discoverMessenger.emit("deployment discover nextIP", discoverProcess);
            if (warn != false) {
                var device = new Device(deviceIP, false, null, null, null, warn);
                discoverMessenger.emit("deployment discover ip done", discoverProcess, device);
            } else if (err != false) discoverMessenger.emit("deployment discover ip error", discoverProcess, deviceCount);
            else getInfo(discoverProcess, deviceIP, data);
        });
    }
}

function getInfo(discoverProcess, deviceIP, data){
    var dataSplitted = data.split('\r\n');
    var macAddress, serialNumber, productType;
    for (var i in dataSplitted){
        if (dataSplitted[i].indexOf('Ethernet MAC address:') >= 0) macAddress = dataSplitted[i].split('Ethernet MAC address:')[1].trim();
        else if (dataSplitted[i].indexOf('Serial number:') >= 0) serialNumber = dataSplitted[i].split('Serial number:')[1].trim();
        else if (dataSplitted[i].indexOf('Product name:') >= 0) productType = dataSplitted[i].split('Product name:')[1].trim();
    }
    var device = new Device(deviceIP, true, macAddress, serialNumber, productType, "");
    asatConsole.info('New ' + productType + ' found at ' + deviceIP + "(mac address: " + macAddress + ', serial number: ' + serialNumber + ")");
    discoverMessenger.emit("deployment discover ip done", discoverProcess, device);
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
    return ipSplitted[0]+"."+ipSplitted[1]+"."+ipSplitted[2]+"."+ipSplitted[3];
}