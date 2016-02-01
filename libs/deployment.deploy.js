var SSH = require("./net.ssh");
var Commands = require("./aerohive.commands");
var Device = require('./aerohive.device');
var discoverMessenger;
var asatConsole;
var delayExecute = 2;

module.exports.start = function (discoverProcess, deviceList, commonParam, dhcpParam, credentials, threads, myConsole, messenger) {
    discoverMessenger = messenger;
    asatConsole = myConsole;
    var runningProcess = 0;
    var deviceNum = 0;
    var stop = false;

    discoverMessenger.emit("depl deploy start", discoverProcess, deviceList.length);
    for (var i = 0; i < threads; i++) {
        if (deviceList.hasOwnProperty(deviceNum)) {
            runningProcess++;
            configureDevice(discoverProcess, deviceNum, deviceList[deviceNum], commonParam, dhcpParam, credentials);
            deviceNum++;
        }
    }

    discoverMessenger.on("depl deploy nextDevice", function (process) {
        if (discoverProcess == process) {
            runningProcess--;
            if (deviceList.hasOwnProperty(deviceNum) && !stop) {
                runningProcess++;
                configureDevice(discoverProcess, deviceNum, deviceList[deviceNum], commonParam, dhcpParam, credentials);
                deviceNum++;
            } else if (runningProcess == 0) {
                discoverMessenger.emit("depl deploy end", process);
            }
        }
    }).on('depl deploy stop', function () {
        stop = true;
    })
};

function configureDevice(discoverProcess, devNum, device, commonParam, dhcpParam, credentials) {
    if (device.selected) {
        var ipAddress = device.ipAddress;
        var commands = generateCommands(device, devNum, commonParam, dhcpParam);
        asatConsole.debug(ipAddress + ': configuring device.');
        SSH.connectDevice(ipAddress, credentials, commands, asatConsole, function (err, warn, succ) {
            if (err) {
                asatConsole.error(ipAddress + ': ' + err);
                discoverMessenger.emit("depl deploy nextDevice", discoverProcess);
                discoverMessenger.emit("depl deploy update", discoverProcess, devNum, err, warn, succ);
            } else if (commonParam.reboot.enable == false) {
                if (!err && warn == "") succ = "Configuration done.";
                asatConsole.info(ipAddress + ': configuration done');
                discoverMessenger.emit("depl deploy nextDevice", discoverProcess);
                discoverMessenger.emit("depl deploy update", discoverProcess, devNum, err, warn, succ);
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
                        discoverMessenger.emit("depl deploy nextDevice", discoverProcess);
                        discoverMessenger.emit("depl deploy update", discoverProcess, devNum, err, warning, succ);
                    })
                }, delayExecute * 1100);
            }
        });
    }
}

function generateCommands(device, devNum, commonParam, dhcpParam) {
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
    if (device.configuration.nativeVlan == "") commands.push(Commands.setNativeVlan(device.configuration.nativeVlan));
    if (device.configuration.mgmtVlan == "") commands.push(Commands.setMgmtVlan(device.configuration.mgmtVlan));
    if (devNum == dhcpParam.deviceId && dhcpParam.enable){
        var dhcpInterface = "mgt0";
        if (!dhcpParam.mgt0) {
            dhcpInterface = "mgt0.1";
            commands.push(Commands.createNewMgtInterface(dhcpInterface, dhcpParam.vlanID));
            commands.push(Commands.setNewMgtInterfaceIp(dhcpInterface, dhcpParam.ipAddress, dhcpParam.bitmask));
        }
        commands.push(Commands.setDhcpServerPool(dhcpInterface, dhcpParam.poolStart, dhcpParam.poolEnd));
        if (dhcpParam.options.gateway != "") commands.push(Commands.setDhcpServerGateway(dhcpInterface, dhcpParam.options.gateway));
        if (dhcpParam.options.dns != "") commands.push(Commands.setDhcpServerDns(dhcpInterface, dhcpParam.options.dns));
        if (dhcpParam.options.ntp != "") commands.push(Commands.setDhcpServerNtp(dhcpInterface, dhcpParam.options.ntp));
        if (dhcpParam.options.domain != "") commands.push(Commands.setDhcpServerDomain(dhcpInterface, dhcpParam.options.domain));
        commands.push(Commands.setDhcpServerEnable(dhcpInterface, true));
    }
    if (commonParam.save.enable) commands.push(Commands.reboot());
    commands.push(Commands.closeTagDelay());
    return commands;

}
