function AerohiveCommands() {

    /*
     * This class is used to quickly generate commands
     * Each command sent to an AP is validated and generated here
     */

    this.errorCode = 0;
    this.command = "";
}

AerohiveCommands.prototype.getErrorCode = function () {
    return this.errorCode;
};
AerohiveCommands.prototype.getCommand = function () {
    return this.command;
};

AerohiveCommands.prototype.openTagDelay = function (time) {
    this.command = "exec delay-execute " + time;
    return this.command;
};

AerohiveCommands.prototype.closeTagDelay = function () {
    this.command = "no exec delay-execute";
    return this.command;
};
AerohiveCommands.prototype.saveConf = function () {
    this.command = "save conf";
    return this.command;
};
AerohiveCommands.prototype.reboot = function () {
    this.command = "reboot";
    return this.command;
};
AerohiveCommands.prototype.setDhcpClient = function (dhcp) {
    if (dhcp) {
        this.errorCode = 0;
        this.command = "int mgt0 dhcp client";
    }
    else {
        this.errorCode = 0;
        this.command = "no int mgt0 dhcp client";
    }
    return this.errorCode;
};
AerohiveCommands.prototype.setIpAddress = function (ip, mask) {
    if (InetAddressValidator.getInstance().isValidInet4Address(ip)) {
        if (InetAddressValidator.getInstance().isValidInet4Address(ip)) {
            this.errorCode = 0;
            this.command = "interface mgt0 ip " + ip + " " + mask;
        }
        else {
                if ((mask <= 32) && (mask >= 0)) {
                    this.errorCode = 0;
                    this.command = "interface mgt0 ip " + ip + "/" + mask;
                } else {
                this.errorCode = 1;
                this.command = "Error: Bad netmask";
            }
        }
    }
    else {
        this.errorCode = 2;
        this.command = "Error: Bad IP address";
    }
    return this.errorCode;
};
AerohiveCommands.prototype.setNoIpAddress = function () {
    return "no interface mgt0 ip";
};
AerohiveCommands.prototype.setMgmtVlan = function (mgmtVlan) {
    if ((mgmtVlan <= 4095) && (mgmtVlan > 0)) {
        this.errorCode = 0;
        this.command = "interface mgt0 vlan " + mgmtVlan;
    }
    else {
        this.errorCode = 1;
        this.command = "Error: Bad mgmt vlan";
    }
    return this.errorCode;
};
AerohiveCommands.prototype.setNativeVlan = function (nativeVlan) {
    if ((nativeVlan <= 4095) && (nativeVlan > 0)) {
        this.errorCode = 0;
        this.command = "interface mgt0 native-vlan " + nativeVlan;
    }
    else {
        this.errorCode = 1;
        this.command = "Error: Bad native vlan";
    }
    return this.errorCode;
};
AerohiveCommands.prototype.setIpRoute = function (gw) {
    if (InetAddressValidator.getInstance().isValidInet4Address(gw)) {
        this.errorCode = 0;
        this.command = "ip route default gateway " + gw;
    }
    else {
        this.errorCode = 1;
        this.command = "Error: Bad IP address for gateway";
    }
    return this.errorCode;
};
AerohiveCommands.prototype.setCapwapClientServer = function (server) {
    this.command = "capwap client server name " + server;
    return 0;
};
AerohiveCommands.prototype.setCapwapClientServerPort = function (port) {
    this.command = "capwap client server port " + port;
    return 0;
};
AerohiveCommands.prototype.setCapwapClientTransport = function (http) {
    if (http) {
        this.command = "capwap client transport HTTP";
    }
    else {
        this.command = "no capwap client transport HTTP";
    }
    return 0;
};

AerohiveCommands.prototype.setCapwapClientProxy = function (server, port) {
    if (!server) {
        this.command = "no capwap client HTTP proxy name";
    } else {
        this.command = "capwap client HTTP proxy name " + server + " port " + port;
    }
    return 0;
};
AerohiveCommands.prototype.setCapwapClientProxyAuth = function (user, password) {
    if (!user) {
        this.command = "no capwap client HTTP proxy user";
    } else {
        this.command = "capwap client HTTP proxy user " + user + " password " + password;
    }
    return 0;
};

AerohiveCommands.prototype.setRegionMode = function (region) {
    this.command = "boot-param region " + region;
    return this.errorCode;
};

AerohiveCommands.prototype.setCountryCode = function (country) {
    var countryCode = -1;
    try {
        countryCode = Integer.valueOf(country);
    }
    finally {
        if ((countryCode < 10000) && (countryCode > 0)) {
            this.errorCode = 0;
            this.command = "boot-param country-code " + countryCode;
        }
        else {
            this.errorCode = 1;
            this.command = "Error: Bad country code";
        }
    }
    return this.errorCode;
};

AerohiveCommands.prototype.setRegion = function (region) {
    if ((region.toLowerCase().matches("fcc")) || region.toLowerCase().matches("world")) {
        this.errorCode = 0;
        this.command = "boot-param region " + region;
    }
    else {
        this.errorCode = 1;
        this.command = "Error: Bad region";
    }
    return this.errorCode;
};

AerohiveCommands.prototype.setDns = function (ip) {
    if (InetAddressValidator.getInstance().isValidInet4Address(ip)) {
        this.errorCode = 0;
        this.command = "dns server-ip " + ip;
    }
    else {
        this.errorCode = 1;
        this.command = "Error: Bad IP address DNS server";
    }
    return this.errorCode;
};
AerohiveCommands.prototype.setNtp = function (server) {
    this.errorCode = 0;
    this.command = "ntp server " + server;
    return this.errorCode;
};

AerohiveCommands.prototype.getHw = function () {
    this.command = "show hw";
    return this;
};
AerohiveCommands.prototype.getIntMgt0 = function () {
    this.command = "show interface mgt0";
    return this;
};
AerohiveCommands.prototype.createNewMgtInterface = function (dhcpInterface, vlan) {
    this.command = "interface " + dhcpInterface + " vlan " + vlan;
    return this;
};
AerohiveCommands.prototype.setNewMgt0InterfaceIp = function (dhcpInterface, ipAddress, netmask) {
    this.command = "interface " + dhcpInterface + " ip " + ipAddress + "/" + netmask;
    return this;
};
AerohiveCommands.prototype.setDhcpServerPool = function (dhcpInterface, start, stop) {
    this.command = "interface " + dhcpInterface + " dhcp-server ip-pool " + start + " " + stop;
    return this;
};
AerohiveCommands.prototype.setDhcpServerArpCheck = function (dhcpInterface, check) {
    var arpCheck = "";
    if (!check) {
        arpCheck = "no ";
    }
    this.command = arpCheck + "interface " + dhcpInterface + " dhcp-server arp-check";
    return this;
};
AerohiveCommands.prototype.setDhcpServerGateway = function (dhcpInterface, gateway) {
    this.command = "interface " + dhcpInterface + " dhcp-server options default-gateway " + gateway;
    return this;
};
AerohiveCommands.prototype.setDhcpServerNetmask = function (dhcpInterface, netmask) {
    this.command = "interface " + dhcpInterface + " dhcp-server options netmask " + netmask;
    return this;
};
AerohiveCommands.prototype.setDhcpServerDns = function (dhcpInterface, dns) {
    this.command = "interface " + dhcpInterface + " dhcp-server options dns1 " + dns;
    return this;
};
AerohiveCommands.prototype.setDhcpServerEnable = function (dhcpInterface, dhcpEnable) {
    var enableCmd = "";
    if (!dhcpEnable) {
        enableCmd = "no ";
    }
    this.command = enableCmd + "interface " + dhcpInterface + " dhcp-server enable";
    return this;
};


