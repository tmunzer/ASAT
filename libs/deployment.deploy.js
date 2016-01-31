var SSH = require("./net.ssh");
var Commands = require("./aerohive.commands");
var Device = require('./aerohive.device');
var discoverMessenger;
var asatConsole;
var delayExecute = 2;

module.exports.start = function (discoverProcess, deviceList, commonParam, credentials, threads, myConsole, messenger) {
    discoverMessenger = messenger;
    asatConsole = myConsole;
    var runningProcess = 0;
    var deviceNum = 0;
    var stop = false;

    discoverMessenger.emit("deployment deploy start", discoverProcess, deviceList.length);
    for (var i = 0; i < threads; i++) {
        if (deviceList.hasOwnProperty(deviceNum)) {
            runningProcess++;
            configureDevice(discoverProcess, deviceNum, deviceList[deviceNum], commonParam, credentials);
            deviceNum++;
        }
    }

    discoverMessenger.on("deployment deploy nextDevice", function (process) {
        if (discoverProcess == process) {
            runningProcess--;
            if (deviceList.hasOwnProperty(deviceNum) && !stop) {
                runningProcess++;
                configureDevice(discoverProcess, deviceNum, deviceList[deviceNum], commonParam, credentials);
                deviceNum++;
            } else if (runningProcess == 0) {
                discoverMessenger.emit("deployment deploy end", process);
            }
        }
    }).on('deployment deploy stop', function () {
        stop = true;
    })
};

function configureDevice(discoverProcess, devNum, device, commonParam, credentials) {
    if (device.selected) {
        var ipAddress = device.ipAddress;
        var commands = generateCommands(device, commonParam);
        asatConsole.debug(ipAddress + ': configuring device.');
        SSH.connectDevice(ipAddress, credentials, commands, asatConsole, function (err, warn, succ) {
            if (err) {
                asatConsole.error(ipAddress + ': ' + err);
                discoverMessenger.emit("deployment deploy nextDevice", discoverProcess);
                discoverMessenger.emit("deployment deploy update", discoverProcess, devNum, err, warn, succ);
            } else if (commonParam.reboot.enable == false) {
                if (!err && warn == "") succ = "Configuration done.";
                asatConsole.info(ipAddress + ': configuration done');
                discoverMessenger.emit("deployment deploy nextDevice", discoverProcess);
                discoverMessenger.emit("deployment deploy update", discoverProcess, devNum, err, warn, succ);
            } else {
                var warning = warn;
                setTimeout(function () {
                    asatConsole.info(ipAddress + ': configuration done. Rebooting device');
                    if (device.configuration.ipAddress != "") {
                        ipAddress = device.configuration.ipAddress;
                        asatConsole.info(device.ipAddress + " is now at " + ipAddress);
                    }
                    SSH.connectDevice(ipAddress, credentials, ["reboot"], asatConsole, function (err, warn, succ) {
                        asatConsole.info(device.ipAddress + ': reboot in progress');
                        warning += warn;
                        if (!err && warning == "") succ = "Configuration and reboot done.";
                        discoverMessenger.emit("deployment deploy nextDevice", discoverProcess);
                        discoverMessenger.emit("deployment deploy update", discoverProcess, devNum, err, warning, succ);
                    })
                }, delayExecute * 1100);
            }
        });
    }
}

function generateCommands(device, commonParam) {
    var commands = [];
    commands.push(Commands.openTagDelay(delayExecute));
    if (commonParam.region.enable) commands.push(Commands.setRegion(commonParam.region.value));
    if (commonParam.country.enable) commands.push(Commands.setCountryCode(commonParam.country.value));
    if (commonParam.dns.enable) commands.push(Commands.setDns(commonParam.dns.value));
    if (commonParam.ntp.enable) commands.push(Commands.setNtp(commonParam.ntp.value));
    if (commonParam.capwap.enable) {
        if (!commonParam.capwap.configured) {
            commands.push(Commands.setCapwapClientServer());
            commands.push(Commands.setCapwapClientServerPort());
        } else {
            commands.push(Commands.setCapwapClientServer(commonParam.capwap.server));
            commands.push(Commands.setCapwapClientServerPort(commonParam.capwap.port));
            if (commonParam.capwap.http.enable) {
                commands.push(Commands.setCapwapClientTransport(commonParam.capwap.http.configured));
                if (commonParam.capwap.http.configured) {
                    if (commonParam.capwap.http.proxy.enable) {
                        if (!commonParam.capwap.http.proxy.configured) {
                            commands.push(Commands.setCapwapClientProxy());
                        } else {
                            commands.push(Commands.setCapwapClientProxy(commonParam.capwap.http.proxy.host, commonParam.capwap.http.proxy.port));
                            if (commonParam.capwap.http.proxy.auth.enable) {
                                if (!commonParam.capwap.http.proxy.auth.configured) {
                                    commands.push(Commands.setCapwapClientProxyAuth());
                                } else {
                                    commands.push(Commands.setCapwapClientProxyAuth(commonParam.capwap.http.proxy.auth.user, commonParam.capwap.http.proxy.auth.password));
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (device.configuration.ipAddress == "") commands.push(Commands.setIpAddress());
    else {
        commands.push(Commands.setIpAddress(device.configuration.ipAddress, device.configuration.netmask));
        commands.push(Commands.setIpRoute(device.configuration.gateway));
    }
    commands.push(Commands.setNativeVlan(device.configuration.nativeVlan));
    commands.push(Commands.setMgmtVlan(device.configuration.mgmtVlan));
    if (commonParam.save.enable) commands.push(Commands.reboot());
    commands.push(Commands.closeTagDelay());
    return commands;

}
