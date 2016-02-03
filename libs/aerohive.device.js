var Netmask = require("netmask").Netmask;

function Device(ipAddress, valid, hostname, macAddress, serialNumber, deviceType, current, comment) {
    this.hostname = hostname || "";
    this.isValid = valid;
    this.comment = comment || "";
    this.macAddress = "";
    this.deviceType = "";
    this.serialNumber = "";
    this.current = current || {
            dhcp: true,
            ipAddress: ipAddress,
            netmask: "",
            gateway: "",
            nativeVlan: "",
            mgmtVlan: ""
        };
    this.configuration = this.current;
    if (valid){
        this.macAddress = normalizeMAC(macAddress);
        if (validateSN(serialNumber)) this.serialNumber = serialNumber;
        else this.serialNumber = "unknown";
        this.deviceType = deviceType;
        var block = new Netmask(this.current.ipAddress + "/" + this.current.netmask);
        this.cidr = this.current.ipAddress + "/" + block.bitmask;
    }
    this.selected = false;
}

Device.prototype.configuredDhcp = function(){
    return (this.current.dhcp != this.configuration.dhcp);
};
Device.prototype.configuredIpAddress = function(){
    return (this.current.ipAddress != this.configuration.ipAddress);
};
Device.prototype.configuredNetmalk = function(){
    return (this.current.netmask != this.configuration.netmask);
};
Device.prototype.configuredGateway = function(){
    return (this.current.gateway == this.configuration.gateway);
};
Device.prototype.configuredNativeVlan = function(){
    return (this.current.nativeVlan != this.configuration.nativeVlan);
};
Device.prototype.configuredMgmtVlan = function(){
    return (this.current.mgmtVlan != this.configuration.mgmtVlan);
};

function validateSN(serial) {
    //TODO improve SN validation
    var isValid = false;
    if (serial && serial.length == 14) {
        isValid = true;
    }
    return isValid;
}

function normalizeMAC(macAddress) {
        var normalizedMac;
        normalizedMac = macAddress.toLowerCase().replace(/\.|,|:|\-/g, "");
        if (normalizedMac.length == 12) normalizedMac = normalizedMac.substring(0, 4) + ":" + normalizedMac.substring(4, 8) + ":" + normalizedMac.substring(8, 12);
        else normalizedMac = "unknown";
    return normalizedMac;

}
function validateMAC (macAddress) {
    if (!macAddress) return "unknown";
    else return normalizeMAC(macAddress);
}

module.exports = Device;