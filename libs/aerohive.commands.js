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
    return "interface mgt0 ip " + ip + " " + mask;
};
module.exports.setNoIpAddress = function () {
    return "no interface mgt0 ip";
};
module.exports.setMgmtVlan = function (mgmtVlan) {
        return "interface mgt0 vlan " + mgmtVlan;
};
module.exports.setNativeVlan = function (nativeVlan) {
        return "interface mgt0 native-vlan " + nativeVlan;
};
module.exports.setIpRoute = function (gw) {
        return "ip route default gateway " + gw;
};
module.exports.setCapwapClientServer = function (server) {
    return "capwap client server name " + server;
};
module.exports.setCapwapClientServerPort = function (port) {
    return "capwap client server port " + port;
};
module.exports.setCapwapClientTransport = function (http) {
    if (http) {
        return "capwap client transport HTTP\r\ncapwap client server port 80";
    }
    else {
        return "no capwap client transport HTTP\r\nno capwap client server port";
    }
};

module.exports.setCapwapClientProxy = function (server, port) {
    if (!server) {
        return "no capwap client HTTP proxy name";
    } else {
        return "capwap client HTTP proxy name " + server + " port " + port;
    }
};
module.exports.setCapwapClientProxyAuth = function (user, password) {
    if (!user) {
        return "no capwap client HTTP proxy user";
    } else {
        return "capwap client HTTP proxy user " + user + " password " + password;
    }
    return 0;
};

module.exports.setRegionMode = function (region) {
    return "boot-param region " + region;
    return this.errorCode;
};

module.exports.setCountryCode = function (country) {
    var countryCode = -1;
    try {
        countryCode = Integer.valueOf(country);
    }
    finally {
        if ((countryCode < 10000) && (countryCode > 0)) {
            this.errorCode = 0;
            return "boot-param country-code " + countryCode;
        }
        else {
            this.errorCode = 1;
            return "Error: Bad country code";
        }
    }
    return this.errorCode;
};

module.exports.setRegion = function (region) {
    if ((region.toLowerCase().matches("fcc")) || region.toLowerCase().matches("world")) {
        this.errorCode = 0;
        return "boot-param region " + region;
    }
    else {
        this.errorCode = 1;
        return "Error: Bad region";
    }
    return this.errorCode;
};

module.exports.setDns = function (ip) {
    if (InetAddressValidator.getInstance().isValidInet4Address(ip)) {
        this.errorCode = 0;
        return "dns server-ip " + ip;
    }
    else {
        this.errorCode = 1;
        return "Error: Bad IP address DNS server";
    }
    return this.errorCode;
};
module.exports.setNtp = function (server) {
    this.errorCode = 0;
    return "ntp server " + server;
    return this.errorCode;
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
    return this;
};
module.exports.setDhcpServerGateway = function (dhcpInterface, gateway) {
    return "interface " + dhcpInterface + " dhcp-server options default-gateway " + gateway;
    return this;
};
module.exports.setDhcpServerNetmask = function (dhcpInterface, netmask) {
    return "interface " + dhcpInterface + " dhcp-server options netmask " + netmask;
    return this;
};
module.exports.setDhcpServerDns = function (dhcpInterface, dns) {
    return "interface " + dhcpInterface + " dhcp-server options dns1 " + dns;
    return this;
};
module.exports.setDhcpServerEnable = function (dhcpInterface, dhcpEnable) {
    var enableCmd = "";
    if (!dhcpEnable) {
        enableCmd = "no ";
    }
    return enableCmd + "interface " + dhcpInterface + " dhcp-server enable";
    return this;
};


