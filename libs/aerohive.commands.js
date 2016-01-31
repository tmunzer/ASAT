module.exports.openTagDelay = function (time) {
    return "exec delay-execute " + time;
};

module.exports.closeTagDelay = function () {
    return "no exec delay-execute";
};
module.exports.saveConf = function () {
    return "save conf";
};
module.exports.reboot = function () {
    return "reboot";
};
module.exports.setDhcpClient = function (dhcp) {
    if (dhcp) {
        return "int mgt0 dhcp client";
    }
    else {
        return "no int mgt0 dhcp client";
    }
};

module.exports.setIpAddress = function (ip, mask) {
    if (ip) return "interface mgt0 ip " + ip + " " + mask;
    else return "no interface mgt0 ip";

};
module.exports.setMgmtVlan = function (mgmtVlan) {
    if (mgmtVlan) return "interface mgt0 vlan " + mgmtVlan;
    else return "no interface mgt0 vlan";
};
module.exports.setNativeVlan = function (nativeVlan) {
    if (nativeVlan) return "interface mgt0 native-vlan " + nativeVlan;
    else return "no interface mgt0 native-vlan";
};
module.exports.setIpRoute = function (gw) {
    if (gw) return "ip route default gateway " + gw;
    else return "no ip route default gateway";
};
module.exports.setCapwapClientServer = function (server) {
    if (server) return "capwap client server name " + server;
    else return "no capwap client server name";
};
module.exports.setCapwapClientServerPort = function (port) {
    if (port) return "capwap client server port " + port;
    else return "no capwap client server port";
};
module.exports.setCapwapClientTransport = function (http) {
    if (http) return "capwap client transport HTTP";
    else return "no capwap client transport HTTP";
};

module.exports.setCapwapClientProxy = function (server, port) {
    if (server) return "capwap client HTTP proxy name " + server + " port " + port;
    else return "no capwap client HTTP proxy name";
};
module.exports.setCapwapClientProxyAuth = function (user, password) {
    if (user) return "capwap client HTTP proxy user " + user + " password " + password;
    else return "no capwap client HTTP proxy user";
};

module.exports.setCountryCode = function (countryCode) {
        if ((countryCode < 10000) && (countryCode > 0)) return "boot-param country-code " + countryCode;
        else return "";
};

module.exports.setRegion = function (region) {
    if ((region.toLowerCase() == "fcc") || region.toLowerCase() == "world") {
        return "boot-param region " + region;
    }
    else {
        return "";
    }
};

module.exports.setDns = function (dns) {
    if (dns) return "dns server-ip " + dns;
    else return "no dns server-ip";

};
module.exports.setNtp = function (ntp) {
    if (ntp) return "ntp server " + ntp;
    else return "no ntp server";
};

module.exports.getHw = function () {
    return "show hw";
    return this;
};
module.exports.getIntMgt0 = function () {
    return "show interface mgt0";
    return this;
};
module.exports.createNewMgtInterface = function (dhcpInterface, vlan) {
    return "interface " + dhcpInterface + " vlan " + vlan;
    return this;
};
module.exports.setNewMgt0InterfaceIp = function (dhcpInterface, ipAddress, netmask) {
    return "interface " + dhcpInterface + " ip " + ipAddress + "/" + netmask;
    return this;
};
module.exports.setDhcpServerPool = function (dhcpInterface, start, stop) {
    return "interface " + dhcpInterface + " dhcp-server ip-pool " + start + " " + stop;
    return this;
};
module.exports.setDhcpServerArpCheck = function (dhcpInterface, check) {
    var arpCheck = "";
    if (!check) {
        arpCheck = "no ";
    }
    return arpCheck + "interface " + dhcpInterface + " dhcp-server arp-check";
};
module.exports.setDhcpServerGateway = function (dhcpInterface, gateway) {
    return "interface " + dhcpInterface + " dhcp-server options default-gateway " + gateway;
};
module.exports.setDhcpServerNetmask = function (dhcpInterface, netmask) {
    return "interface " + dhcpInterface + " dhcp-server options netmask " + netmask;
};
module.exports.setDhcpServerDns = function (dhcpInterface, dns) {
    return "interface " + dhcpInterface + " dhcp-server options dns1 " + dns;
};
module.exports.setDhcpServerEnable = function (dhcpInterface, dhcpEnable) {
    var enableCmd = "";
    if (!dhcpEnable) {
        enableCmd = "no ";
    }
    return enableCmd + "interface " + dhcpInterface + " dhcp-server enable";
};


