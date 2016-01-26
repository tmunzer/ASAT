function AerohiveDevice(ipAddress, macAddress, serialNumber, deviceType) {

    this.ipAddress = ipAddress;
    this.setMacAddress(macAddress);
    this.setSerialNumber(serialNumber);
    this.deviceType = deviceType;
    this.configuration = null;
    this.selected = false;
}

AerohiveDevice.prototype.getMacAddress = function () {
    return this.macAddress;
};
AerohiveDevice.prototype.getIpAddress = function () {
    return this.ipAddress;
};
AerohiveDevice.prototype.getDeviceType = function () {
    return this.deviceType;
};
AerohiveDevice.prototype.getSerialNumber = function () {
    return this.serialNumber;
};
AerohiveDevice.prototype.getConfiguration = function() {
    return this.configuration;
}

function validateSN(serial) {
    //TODO improve SN validation
    var isValid = false;
    if (serial.length() == 14) {
        isValid = true;
    }
    return isValid;
}

AerohiveDevice.prototype.setSerialNumber = function (serialNumber) {
    var isValid = false;
    if (validateSN(serialNumber)) {
        this.serialNumber = serialNumber;
        isValid = true;
    }
    return isValid;
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
