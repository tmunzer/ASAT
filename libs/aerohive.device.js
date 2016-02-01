module.exports = function(ipAddress, valid, hostname, macAddress, serialNumber, deviceType, comment) {
    this.ipAddress = ipAddress;
    this.hostname = hostname || "";
    this.isValid = valid;
    this.comment = comment || "";
    this.macAddress = "";
    this.deviceType = "";
    this.serialNumber = "";
    if (valid){
        this.macAddress = normalizeMAC(macAddress);
        if (validateSN(serialNumber)) this.serialNumber = serialNumber;
        else this.serialNumber = "unknown";
        this.deviceType = deviceType;
        this.selected = false;
        this.configuration = {
            ipAddress : "",
            netmask: "",
            gateway: "",
            nativeVlan: "",
            mgmtVlan: ""
        };
    }
    this.selected = false;
    this.cidr = "";
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

