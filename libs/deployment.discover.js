
var SSH = require("./net.ssh");
var Netmask = require("netmask").Netmask;
var Device = require('./aerohive.device');
var discoverMessenger;
var deviceCount;
var deviceNumber;
var asatConsole;

module.exports.discover = function(cidr, credentials, threads, myConsole, messenger){
    var block = new Netmask(cidr);
    deviceCount = block.size;
    deviceNumber = 1;
    discoverMessenger = messenger;
    asatConsole = myConsole;
    discoverMessenger.emit("update", deviceNumber, deviceCount);
    var stop = false;

    var deviceIp = block.first;
    asatConsole.info("Disovering network " + cidr);

    for (var i = 0; i < threads; i ++){
        if (block.contains(deviceIp)) {
            discoverDevice(deviceIp, credentials);
            deviceIp = nextIP(deviceIp);
        }
    }

    discoverMessenger.on("nextIP", function(){
        console.log('next');
        if (block.contains(deviceIp) && !stop) {
            discoverDevice(deviceIp, credentials);
            deviceIp = nextIP(deviceIp);
        }

    }).on('stop', function(){
        stop = true;
    })
};

function discoverDevice(deviceIP, credentials){
    if (deviceIP){
        asatConsole.debug('Testing IP Address ' + deviceIP);
        console.log('Testing IP Address ' + deviceIP);
        SSH.connectDevice(deviceIP, credentials, ["sh hw"], asatConsole, function(err, data){
            discoverMessenger.emit("nextIP", data);
            if (err) discoverMessenger.emit("update", deviceNumber, deviceCount, null);
            else getInfo(deviceIP, data);
        });
    }
}

function getInfo(deviceIP, data){
    var dataSplitted = data.split('\r\n');
    var macAddress, serialNumber, productType;
    for (var i in dataSplitted){
        if (dataSplitted[i].indexOf('Ethernet MAC address:') >= 0) macAddress = dataSplitted[i].split('Ethernet MAC address:')[1].trim();
        else if (dataSplitted[i].indexOf('Serial number:') >= 0) serialNumber = dataSplitted[i].split('Serial number:')[1].trim();
        else if (dataSplitted[i].indexOf('Product name:') >= 0) productType = dataSplitted[i].split('Product name:')[1].trim();
    }
    var device = new Device(deviceIP, macAddress, serialNumber, productType);
    asatConsole.info('New ' + productType + ' found at ' + deviceIP + "(mac address: " + macAddress + ', serial number: ' + serialNumber + ")");
    discoverMessenger.emit("update", deviceNumber, deviceCount, device);
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
                    discoverMessenger.emit("end");
                    return false
                }
            }
        }
    }

    deviceNumber ++;
    return ipSplitted[0]+"."+ipSplitted[1]+"."+ipSplitted[2]+"."+ipSplitted[3];
}