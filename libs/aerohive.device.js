function AerohiveDevice(ipAddress, macAddress, serialNumber) {

    if (ipAddress) {
        if (InetAddressValidator.getInstance().isValidInet4Address(ipAddress)) {
            this.ipAddress = ipAddress;
        }
    } else this.ipAddress = "";
    if (macAddress) {
        this.setMacAddress(macAddress);
    } else this.macAddress = "";
    if (serialNumber) {
        this.setSerialNumber(serialNumber);

    } else this.serialNumber = "";

    this.netmask = "";
    this.gateway = "";
    this.nativeVlan = 0;
    this.mgmtVlan = 0;
    this.type = "";
    this.dhcp = true;

}

AerohiveDevice.prototype.setNetmask = function (netmask) {
    if (InetAddressValidator.getInstance().isValidInet4Address(netmask)) {
        this.netmask = netmask;
    }
};
AerohiveDevice.prototype.getNetmask = function () {
    return this.netmask;
};
AerohiveDevice.prototype.setGateway = function (gateway) {
    var isValid = false;
    if (InetAddressValidator.getInstance().isValidInet4Address(gateway)) {
        this.gateway = gateway;
        isValid = true;
    }
    return isValid;
};
AerohiveDevice.prototype.getGateway = function () {
    return this.gateway;
};
validateVlan = function (vlan) {
    var isValid = false;
            if (vlan && (vlan > 0) && (vlan < 4096)) {
                isValid = true;
            }

    return isValid;
};

AerohiveDevice.prototype.setMgmtVlan = function (vlan) {
    var isValid = validateVlan(vlan);
    if (isValid) {
        this.mgmtVlan = vlan;
    }
    return isValid;
};
AerohiveDevice.prototype.getMgmtVlan = function () {
    return this.mgmtVlan;
};
AerohiveDevice.prototype.getMgmtVlanString = function () {
    if (this.mgmtVlan == 0) {
        return "";
    } else {
        return this.mgmtVlan;
    }
};

AerohiveDevice.prototype.setNativeVlan = function (vlan) {
    var isValid = validateVlan(vlan);
    if (isValid) {
        this.nativeVlan = vlan;
    }
    return isValid;
};
AerohiveDevice.prototype.getNativeVlan = function () {
    return this.nativeVlan;
};
AerohiveDevice.prototype.getNativeVlanString = function () {
    if (this.nativeVlan == 0) {
        return "";
    } else {
        return this.nativeVlan;
    }
};
AerohiveDevice.prototype.setDeviceType = function (serial) {
    var deviceType = "Unknown";
        var is = getClass().getResourceAsStream("/AerohiveScripting/res/DevicesType.txt");
        var isr = new InputStreamReader(is);
        var reader = new BufferedReader(isr);
        var line = null;
        while ((line = reader.readLine()) != null) {
            if (serial.startsWith(line.split(" ")[1])) {
                deviceType = line.split(" ")[0];
            }
        }
        reader.close();

    this.type = deviceType;
};

AerohiveDevice.prototype.getDeviceType = function () {
    return this.type;
};
AerohiveDevice.prototype.validateSN = function (serial) {
    //TODO improve SN validation
    var isValid = false;
    if (serial.length() == 14) {
        isValid = true;
    }
    return isValid;
};

AerohiveDevice.prototype.setSerialNumber = function (serialNumber) {
    var isValid = false;
    if (validateSN(serialNumber)) {
        this.serialNumber = serialNumber;
        this.setDeviceType(serialNumber);
        isValid = true;
    }
    return isValid;
};
AerohiveDevice.prototype.getSerialNumber = function () {
    if (this.serialNumber.isEmpty()) {
        return "";
    } else {
        return this.serialNumber;
    }
};


normalizeMAC = function (macAddress) {
    var normalizedMac;
    normalizedMac = macAddress.toLowerCase().replaceAll("(\\.|\\,|\\:|\\-)", "");
    if (normalizedMac.length() == 12) {
        normalizedMac = normalizedMac.substring(0, 3) + ":" + normalizedMac.substring(4, 7) + ":" + normalizedMac.substring(8, 11);
    } else {
        normalizedMac = "ffff:ffff:ffff";
    }
    return normalizedMac;

};
validateMAC = function (macAddress) {
    var isValid = false;
    if (normalizeMAC(macAddress) != "ffff:ffff:ffff") {
        isValid = true;
    }
    return isValid;
};
AerohiveDevice.prototype.setMacAddress = function (macAddress) {
    var isValid = false;
    if (validateMAC(macAddress)) {
        this.macAddress = macAddress;
        isValid = true;
    }
    return isValid;
};
AerohiveDevice.prototype.getMacAddress = function () {
    return this.macAddress;
};

AerohiveDevice.prototype.getIpAddress = function () {
    return this.ipAddress;
};
AerohiveDevice.prototype.setDhcp = function (enable) {
    this.dhcp = enable;
};
AerohiveDevice.prototype.getDhcp = function () {
    return this.dhcp;
};
AerohiveDevice.prototype.getDhcpString = function () {
    if (this.dhcp) {
        return "enable";
    } else {
        return "disable";
    }
};

