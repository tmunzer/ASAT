var dhcpParam = {
    enable: false,
    deviceId: null,
    deviceSerial: "",
    mgt0: true,
    vlanID: 0,
    ipAddress: "",
    netmask: "",
    bitmask: "",
    poolStart: "",
    poolEnd: "",
    options: {
        gateway: "",
        dns: "",
        ntp: "",
        domain: ""
    }
};

/*  ======================= DHCP =======================  */

/*  ======================= DHCP =======================  */


function checkBlock(prefix) {
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var netmaskElem = $("#" + prefix + "-netmask");
    var gwDeviceElem = $("#" + prefix + "-gwDevice");
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");
    var gwDhcpElem = $("#" + prefix + '-gwDhcp');

    removeQtip("#" + prefix + "-gwDevice");
    removeQtip("#" + prefix + "-poolStart");
    removeQtip("#" + prefix + "-poolEnd");

    if (ipDeviceElem.hasClass("isValid") && netmaskElem.hasClass("isValid")) {
        var block = new Netmask(ipDeviceElem.val() + "/" + netmaskElem.val());
        if (block) {
            if ((dhcpParam.mgt0) && (gwDeviceElem.val() != "" && !block.contains(gwDeviceElem.val()))) {
                gwDeviceElem.addClass('isNotValid').removeClass('isValid');
                displayQtip(prefix + "-gwDevice", "Gateway IP Address does not belong to the DHCP server subnet.", null, null, null);
                return false;
            } else if (poolStartElem.val() != "" && !block.contains(poolStartElem.val())) {
                poolStartElem.addClass('isNotValid').removeClass('isValid');
                displayQtip(prefix + "-poolStart", "DHCP IP Pool does not belong to the DHCP server subnet.", null, null, null);
                return false;
            } else if (poolEndElem.val() != "" && !block.contains(poolEndElem.val())) {
                poolEndElem.addClass('isNotValid').removeClass('isValid');
                displayQtip(prefix + "-poolEnd", "DHCP IP Pool does not belong to the DHCP server subnet.", null, null, null);
                return false;
            } else if (gwDhcpElem.val() != "" && !block.contains(gwDhcpElem.val())) {
                gwDhcpElem.addClass('isNotValid').removeClass('isValid');
                displayQtip(prefix + "-gwDhcp", "Gateway IP Address does not belong to the DHCP server subnet.", null, null, null);
                return false;
            } else {
                gwDeviceElem.removeClass('isNotValid').addClass('isValid');
                poolStartElem.removeClass('isNotValid').addClass('isValid');
                poolEndElem.removeClass('isNotValid').addClass('isValid');
                dhcpParam.bitmask = block.bitmask;
                return true;
            }

        }
    }
    return true;
}

function checkVlan(prefix) {
    var vlanElem = $("#" + prefix + "-vlanID");
    removeQtip("#" + prefix + "-vlan");

    if (vlanElem.val() >= 0 && vlanElem.val() <= 4095) {
        vlanElem.addClass("isValid").removeClass("isNotValid");
        dhcpParam.vlanID = vlanElem.val();
        saveButtonState(prefix);
    } else if (vlanElem.val() == deviceList[dhcpParam.deviceId].mgmtVlan) {
        vlanElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-vlanID", "DHCP VLAN ID can't be equal to Device MGT0 VLAN ID.", null, null, null);
    } else if (vlanElem.val() == "") {
        vlanElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-vlanID", "DHCP VLAN ID is required.", null, null, null);
    } else {
        vlanElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-vlanID", "DHCP VLAN ID is not valid.", null, null, null);
    }
}

function checkIpDevice(prefix) {
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    removeQtip("#" + prefix + "-ipDevice");


    if (validateIP(ipDeviceElem.val())) {
        ipDeviceElem.addClass("isValid").removeClass("isNotValid");
        if (compareIpDeviceToGwDevice(prefix)
            && compareIpDeviceToGwDhcp(prefix)
            && compareIpDeviceToPool(prefix)
            && compareIpDeviceToDns(prefix)
            && compareIpDeviceToNtp(prefix)
            && checkBlock(prefix)) {
            dhcpParam.ipAddress = ipDeviceElem.val();
            saveButtonState(prefix);
        }
    } else if (ipDeviceElem.val() == "") {
        ipDeviceElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-ipDevice", "DHCP Server IP Address is required.", null, null, null);
    } else {
        ipDeviceElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-ipDevice", "DHCP Server IP Address is not valid.", null, null, null);
    }
}

function checkNetmask(prefix) {
    var netmaskElem = $("#" + prefix + "-netmask");
    removeQtip("#" + prefix + "-netmask");


    if (validateIP(netmaskElem.val())) {
        netmaskElem.addClass("isValid").removeClass("isNotValid");
        if (checkBlock(prefix)) {
            dhcpParam.netmask = netmaskElem.val();
            saveButtonState(prefix);
        }
    } else if (netmaskElem.val() == "") {
        netmaskElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-netmask", "Netmask is required.", null, null, null);
    } else {
        netmaskElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-netmask", "Netmask is not valid.", null, null, null);
    }
}

function checkGwDevice(prefix) {
    var gwDeviceElem = $("#" + prefix + "-gwDevice");
    removeQtip("#" + prefix + "-gwDevice");


    if (dhcpParam.mgt0 && (validateIP(gwDeviceElem.val()) || gwDeviceElem.val() == "")) {
        gwDeviceElem.addClass("isValid").removeClass("isNotValid");
        if (compareIpDeviceToGwDevice(prefix)
            && compareGwDeviceToPool(prefix)
            && checkBlock(prefix)) {
            dhcpParam.gateway = gwDeviceElem.val();
            saveButtonState(prefix);
        }
    } else if (gwDeviceElem.val() == "") {
        gwDeviceElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-gwDevice", "DHCP Server Gateway is required.", null, null, null);
    } else {
        gwDeviceElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-gwDevice", "DHCP Server Gateway is not valid.", null, null, null);
    }
}

function checkPoolStart(prefix) {
    var poolStartElem = $("#" + prefix + "-poolStart");
    removeQtip("#" + prefix + "-poolStart");


    if (validateIP(poolStartElem.val())) {
        poolStartElem.addClass("isValid").removeClass("isNotValid");
        if (compareIpDeviceToPool(prefix)
            && compareGwDeviceToPool(prefix)
            && compareDnsToPool(prefix)
            && compareGwDhcpToPool(prefix)
            && compareNtpToPool(prefix)
            && checkBlock(prefix)
            && comparePool(prefix)) {
            dhcpParam.poolStart = poolStartElem.val();
            saveButtonState(prefix);
        }
    } else if (poolStartElem.val() == "") {
        poolStartElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-gwDevice", "DHCP Server Gateway is required.", null, null, null);
    } else {
        poolStartElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-gwDevice", "DHCP Server Gateway is not valid.", null, null, null);
    }
}

function checkPoolEnd(prefix) {
    var poolEndElem = $("#" + prefix + "-poolEnd");
    removeQtip("#" + prefix + "-poolEnd");


    if (validateIP(poolEndElem.val())) {
        poolEndElem.addClass("isValid").removeClass("isNotValid");
        if (compareIpDeviceToPool(prefix)
            && compareGwDeviceToPool(prefix)
            && compareDnsToPool(prefix)
            && compareGwDhcpToPool(prefix)
            && compareNtpToPool(prefix)
            && checkBlock(prefix)
            && comparePool(prefix)) {
            dhcpParam.poolEnd = poolEndElem.val();
            saveButtonState(prefix);
        }
    } else if (poolEndElem.val() == "") {
        poolEndElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-gwDevice", "DHCP Server Gateway is required.", null, null, null);
    } else {
        poolEndElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-gwDevice", "DHCP Server Gateway is not valid.", null, null, null);
    }
}

function checkGwDhcp(prefix) {
    var gwDhcpElem = $("#" + prefix + "-gwDhcp");
    removeQtip("#" + prefix + "-gwDhcp");


    if (validateIP(gwDhcpElem.val()) || ntpElem.val() == "") {
        gwDhcpElem.addClass("isValid").removeClass("isNotValid");
        if (compareIpDeviceToGwDhcp(prefix)
            && compareGwDhcpToPool(prefix)
            && checkBlock(prefix)) {
            dhcpParam.options.gateway = gwDhcpElem.val();
            saveButtonState(prefix);
        }
    } else {
        gwDhcpElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-gwDevice", "DHCP Server Gateway is not valid.", null, null, null);
    }
}

function checkDns(prefix) {
    var dnsElem = $("#" + prefix + "-dns");
    removeQtip("#" + prefix + "-dns");


    if (validateIP(dnsElem.val()) || ntpElem.val() == "") {
        dnsElem.addClass("isValid").removeClass("isNotValid");
        if (compareIpDeviceToDns(prefix)
            && compareDnsToPool(prefix)) {
            dhcpParam.options.dns = dnsElem.val();
            saveButtonState(prefix);
        }
    } else {
        dnsElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-gwDevice", "DHCP Server Gateway is not valid.", null, null, null);
    }
}

function checkNtp(prefix) {
    var ntpElem = $("#" + prefix + "-ntp");
    removeQtip("#" + prefix + "-ntp");


    if (validateIP(ntpElem.val()) || validateFQDN(ntpElem.val()) || ntpElem.val() == "") {
        ntpElem.addClass("isValid").removeClass("isNotValid");
        if (compareIpDeviceToNtp(prefix)
            && compareNtpToPool(prefix)) {
            dhcpParam.options.ntp = ntpElem.val();
            saveButtonState(prefix);
        }
    } else {
        ntpElem.addClass('isNotValid').removeClass('isValid');
        displayQtip(prefix + "-gwDevice", "DHCP Server Gateway is not valid.", null, null, null);
    }
}

function checkDomain(prefix) {
    var domainElem = $("#" + prefix + "-domain");
    removeQtip("#" + prefix + "-domain");


    if (validateFQDN(domainElem.val()) || domainElem.val() == "") {
        domainElem.addClass("isValid").removeClass("isNotValid");
        dhcpParam.options.domain = domainElem.val();
        saveButtonState(prefix);
    } else {
        domainElem.addClass("isValid").removeClass("isNotValid");
        displayQtip(prefix + "-gwDevice", "Domain value is not valid.", null, null, null);
    }
}

function comparePool(prefix) {
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");
    removeQtip("#" + prefix + "-poolStart");
    removeQtip("#" + prefix + "-poolEnd");
    if (poolStartElem.val() != "" && poolEndElem.val() != "") {
        if (compareIP(poolStartElem.val(), poolEndElem.val()) != -1) {
            poolStartElem.removeClass("isValid").addClass("isNotValid");
            poolEndElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-poolStart", "DHCP Pool is not valid. Please change IP Start or IP End.", null, null, null);
            displayQtip(prefix + "-poolEnd", "DHCP Pool is not valid. Please change IP Start or IP End.", null, null, null);
            return false;
        } else {
            poolStartElem.addClass("isValid").removeClass("isNotValid");
            poolEndElem.addClass("isValid").removeClass("isNotValid");
            return true;
        }
    }
    return true;
}

function compareIpDeviceToGwDhcp(prefix) {
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var gwDhcpElem = $("#" + prefix + "-gwDhcp");
    removeQtip("#" + prefix + "-ipDevice");
    removeQtip("#" + prefix + "-gwDhcp");
    if (ipDeviceElem.val() != "" && gwDhcpElem.val() != "") {
        if (gwDhcpElem.val() == ipDeviceElem.val()) {
            ipDeviceElem.removeClass("isValid").addClass("isNotValid");
            gwDhcpElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-ipDevice", "Device IP Address and Gateway IP Address can't be the same.", null, null, null);
            displayQtip(prefix + "-gwDhcp", "Device IP Address and Gateway IP Address can't be the same.", null, null, null);
            return false;
        } else {
            ipDeviceElem.addClass("isValid").removeClass("isNotValid");
            gwDhcpElem.addClass("isValid").removeClass("isNotValid");
            return true;
        }
    }
    return true;
}

function compareIpDeviceToGwDevice(prefix) {
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var gwDeviceElem = $("#" + prefix + "-gwDevice");
    removeQtip("#" + prefix + "-ipDevice");
    removeQtip("#" + prefix + "-gwDevice");
    if (ipDeviceElem.val() != "" && gwDeviceElem.val() != "") {
        if (ipDeviceElem.val() == gwDeviceElem.val()) {
            ipDeviceElem.removeClass("isValid").addClass("isNotValid");
            gwDeviceElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-ipDevice", "Device IP Address and Gateway IP Address can't be the same.", null, null, null);
            displayQtip(prefix + "-gwDevice", "Device IP Address and Gateway IP Address can't be the same.", null, null, null);
            return false;
        } else {
            ipDeviceElem.addClass("isValid").removeClass("isNotValid");
            gwDeviceElem.addClass("isValid").removeClass("isNotValid");
            return true;
        }
    }
    return true;
}

function compareIpDeviceToPool(prefix) {
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");
    removeQtip("#" + prefix + "-ipDevice");
    removeQtip("#" + prefix + "-poolStart");
    removeQtip("#" + prefix + "-poolEnd");
    if (ipDeviceElem.val() != "" && poolStartElem.val() != "" && poolEndElem.val() != "") {
        if (compareIP(ipDeviceElem.val(), poolStartElem.val()) != -1 && compareIP(ipDeviceElem.val(), poolEndElem.val()) != 1) {
            ipDeviceElem.removeClass("isValid").addClass("isNotValid");
            poolStartElem.removeClass("isValid").addClass("isNotValid");
            poolEndElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-ipDevice", "DHCP Server IP Address can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolStart", "DHCP Server IP Address can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolEnd", "DHCP Server IP Address can't be included into DHCP Pool.", null, null, null);
            return false;
        } else {
            ipDeviceElem.addClass("isValid").removeClass("isNotValid");
            poolStartElem.addClass("isValid").removeClass("isNotValid");
            poolEndElem.addClass("isValid").removeClass("isNotValid");
            return true;
        }
    }
    return true;
}

function compareGwDeviceToPool(prefix) {
    var gwDeviceElem = $("#" + prefix + "-gwDevice");
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");
    removeQtip("#" + prefix + "-gwDevice");
    removeQtip("#" + prefix + "-poolStart");
    removeQtip("#" + prefix + "-poolEnd");
    if (gwDeviceElem.val() != "" && poolStartElem.val() != "" && poolEndElem.val() != "") {
        if (compareIP(gwDeviceElem.val(), poolStartElem.val()) != -1 && compareIP(gwDeviceElem.val(), poolEndElem.val()) != 1) {
            gwDeviceElem.removeClass("isValid").addClass("isNotValid");
            poolStartElem.removeClass("isValid").addClass("isNotValid");
            poolEndElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-gwDevice", "Gateway IP Address can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolStart", "Gateway IP Address can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolEnd", "Gateway IP Address can't be included into DHCP Pool.", null, null, null);
            return false;
        } else {
            gwDeviceElem.addClass("isValid").removeClass("isNotValid");
            poolStartElem.addClass("isValid").removeClass("isNotValid");
            poolEndElem.addClass("isValid").removeClass("isNotValid");
            return true;
        }
    }
    return true;
}


function compareGwDhcpToPool(prefix) {
    var gwDhcpElem = $("#" + prefix + "-gwDhcp");
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");
    removeQtip("#" + prefix + "-gwDhcp");
    removeQtip("#" + prefix + "-poolStart");
    removeQtip("#" + prefix + "-poolEnd");
    if (gwDhcpElem.val() != "" && poolStartElem.val() != "" && poolEndElem.val() != "") {
        if (compareIP(gwDhcpElem.val(), poolStartElem.val()) != -1 && compareIP(gwDhcpElem.val(), poolEndElem.val()) != 1) {
            gwDhcpElem.removeClass("isValid").addClass("isNotValid");
            poolStartElem.removeClass("isValid").addClass("isNotValid");
            poolEndElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-gwDhcp", "Gateway IP Address can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolStart", "Gateway IP Address can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolEnd", "Gateway IP Address can't be included into DHCP Pool.", null, null, null);
            return false;
        } else {
            gwDhcpElem.addClass("isValid").removeClass("isNotValid");
            poolStartElem.addClass("isValid").removeClass("isNotValid");
            poolEndElem.addClass("isValid").removeClass("isNotValid");
            return true;
        }
    }
    return true;
}

function compareIpDeviceToDns(prefix) {
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var dnsElem = $("#" + prefix + "-dns");
    removeQtip("#" + prefix + "-ipDevice");
    removeQtip("#" + prefix + "-dns");
    if (ipDeviceElem.val() != "" && dnsElem.val() != "") {
        if (dnsElem.val() == ipDeviceElem.val()) {
            dnsElem.removeClass("isValid").addClass("isNotValid");
            ipDeviceElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-ipDevice", "Device IP Address and DNS IP Address can't be the same.", null, null, null);
            displayQtip(prefix + "-dns", "Device IP Address and DNS IP Address can't be the same.", null, null, null);
            return false;
        } else {
            ipDeviceElem.addClass("isValid").removeClass("isNotValid");
            dnsElem.addClass("isValid").removeClass("isNotValid");
            return true;
        }
    }
    return true;
}

function compareDnsToPool(prefix) {
    var dnsElem = $("#" + prefix + "-dns");
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");
    removeQtip("#" + prefix + "-dns");
    removeQtip("#" + prefix + "-poolStart");
    removeQtip("#" + prefix + "-poolEnd");
    if (dnsElem.val() != "" && poolStartElem.val() != "" && poolEndElem.val() != "") {
        if (compareIP(dnsElem.val(), poolStartElem.val()) != 1 && compareIP(dnsElem.val(), poolEndElem.val()) != -1) {
            dnsElem.removeClass("isValid").addClass("isNotValid");
            poolStartElem.removeClass("isValid").addClass("isNotValid");
            poolEndElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-dns", "DNS IP Address can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolStart", "DNS IP Address can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolEnd", "DNS IP Address can't be included into DHCP Pool.", null, null, null);
            return false;
        } else {
            dnsElem.addClass("isValid").removeClass("isNotValid");
            poolStartElem.addClass("isValid").removeClass("isNotValid");
            poolEndElem.addClass("isValid").removeClass("isNotValid");
            return true;
        }
    }
    return true;
}

function compareIpDeviceToNtp(prefix) {
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var ntpElem = $("#" + prefix + "-ntp");
    removeQtip("#" + prefix + "-ipDevice");
    removeQtip("#" + prefix + "-ntp");
    if (ipDeviceElem.val() != "" && ntpElem.val() != "") {
        if (ntpElem.val() == ipDeviceElem.val()) {
            ntpElem.removeClass("isValid").addClass("isNotValid");
            ipDeviceElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-ipDevice", "Device IP Address and NTP IP Address/Hostname can't be the same.", null, null, null);
            displayQtip(prefix + "-ntp", "Device IP Address and NTP IP Address/Hostname can't be the same.", null, null, null);
            return false;
        } else {
            ipDeviceElem.addClass("isValid").removeClass("isNotValid");
            ntpElem.addClass("isValid").removeClass("isNotValid");
            return true;
        }
    }
    return true;
}

function compareNtpToPool(prefix) {
    var ntpElem = $("#" + prefix + "-ntp");
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");
    removeQtip("#" + prefix + "-ntp");
    removeQtip("#" + prefix + "-poolStart");
    removeQtip("#" + prefix + "-poolEnd");
    if (ntpElem.val() != "" && poolStartElem.val() != "" && poolEndElem.val() != "") {
        if (compareIP(ntpElem.val(), poolStartElem.val()) != -1 && compareIP(ntpElem.val(), poolEndElem.val()) != 1) {
            ntpElem.removeClass("isValid").addClass("isNotValid");
            poolStartElem.removeClass("isValid").addClass("isNotValid");
            poolEndElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-nt", "NTP IP Address/Hostname can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolStart", "NTP IP Address/Hostname can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolEnd", "NTP IP Address/Hostname can't be included into DHCP Pool.", null, null, null);
            return false;
        } else {
            ntpElem.addClass("isValid").removeClass("isNotValid");
            poolStartElem.addClass("isValid").removeClass("isNotValid");
            poolEndElem.addClass("isValid").removeClass("isNotValid");
            return true;
        }
    }
    return true;
}


function changeDevice(prefix, value) {
    var mgt0Elem = $("#" + prefix + "-mgt0");
    var deviceElem = $("#" + prefix + "-dropdown-device");
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var netmaskElem = $("#" + prefix + "-netmask");
    var gwDeviceElem = $("#" + prefix + "-gwDevice");

    removeAllQtip(prefix);
    $("input.dhcp").each(function () {
        $(this).val('').removeClass("isNotValid").removeClass('isValid');
    });

    var device = deviceList[value];
    dhcpParam.deviceId = value;
    dhcpParam.deviceSerial = device.serialNumber;
    deviceElem.html(device.hostname + ' (' + device.configuration.ipAddress + ')').addClass("isValid");

    if (mgt0Elem.prop("checked")) {
        device.configuration.dhcp = false;
        if (device.configuration.ipAddress != "") {
            ipDeviceElem.val(device.configuration.ipAddress).addClass('isValid');
            checkIpDevice(prefix);
        } else {
            ipDeviceElem.val(device.current.ipAddress).addClass('isValid');
            checkIpDevice(prefix);
        }
        if (device.configuration.netmask != "") {
            netmaskElem.val(device.configuration.netmask).addClass('isValid');
            checkNetmask(prefix);
        } else {
            netmaskElem.val(device.current.netmask).addClass('isValid');
            checkNetmask(prefix);
        }
        if (device.configuration.gateway != "") {
            gwDeviceElem.val(device.configuration.gateway).addClass('isValid');
            checkGwDevice(prefix);
        } else {
            gwDeviceElem.val(device.current.gateway).addClass('isValid');
            checkGwDevice(prefix);
        }
    }
    saveButtonState(prefix);
}

function saveButtonState(prefix) {
    var deviceElem = $("#" + prefix + "-dropdown-device");
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var netmaskElem = $("#" + prefix + "-netmask");
    var gwDeviceElem = $("#" + prefix + "-gwDevice");
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");
    var vlanElem = $("#" + prefix + "-vlanID");

    var isValid = false;
    var saveButton = $("#" + prefix + "-button-next");

    if ($("#" + prefix + "-enable-dhcp").hasClass("fa-check-square-o")) {
        if (deviceElem.hasClass("isValid")) {
            if ($(".dhcp.isNotValid").length == 0 && $(".vlan.isNotValid").length == 0) {
                if (ipDeviceElem.hasClass('isValid') && ipDeviceElem.val() != ""
                    && netmaskElem.hasClass('isValid') && netmaskElem.val() != ""
                    && poolStartElem.hasClass('isValid') && poolStartElem.val() != ""
                    && poolEndElem.hasClass('isValid') && poolEndElem.val() != ""
                ) {
                    if (dhcpParam.mgt0 && gwDeviceElem.hasClass('isValid')) isValid = true;
                    else if (!dhcpParam.mgt0 && vlanElem.hasClass('isValid')) isValid = true;
                }
            }

        }
    } else isValid = true;
    if (isValid) saveButton.prop("disabled", false);
    else saveButton.prop("disabled", true);
}

function enableDhcp(prefix) {
    var enableDhcpElem = $("#" + prefix + "-enable-dhcp");
    if (enableDhcpElem.hasClass("fa-square-o")) {
        enableDhcpElem.removeClass("fa-square-o").addClass('fa-check-square-o').addClass("enabled");
        $("span.dhcp").each(function () {
            $(this).removeClass("disabled");
        });
        $("button.dhcp").each(function () {
            $(this).removeClass("disabled");
        });
        $("input.dhcp").each(function () {
            $(this).prop("disabled", false);
        });
        $("#" + prefix + "-button-next").prop("disabled", false)
    } else {
        enableDhcpElem.addClass("fa-square-o").removeClass('fa-check-square-o').removeClass("enabled");
        $("span.dhcp").each(function () {
            $(this).addClass("disabled");
        });
        $("button.dhcp").each(function () {
            $(this).addClass("disabled");
        });
        $("input.dhcp").each(function () {
            $(this).prop("disabled", true);
        });
        $("#" + prefix + "-button-next").prop("disabled", true);
    }
    saveButtonState(prefix);
}

function changeDhcpInterface(prefix, mgt) {
    var vlanElem = $("#" + prefix + "-vlanID");
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var netmaskElem = $("#" + prefix + "-netmask");
    var gwDeviceElem = $("#" + prefix + "-gwDevice");

    removeAllQtip(prefix);
    $("input.dhcp").each(function () {
        $(this).val('').removeClass("isNotValid").removeClass('isValid');
    });

    switch (mgt) {
        case "mgt0":
            vlanElem.prop("disabled", true);
            gwDeviceElem.prop("disabled", false);
            if (dhcpParam.deviceId) {
                if (deviceList[dhcpParam.deviceId].configuration.ipAddress == "") ipDeviceElem.val(deviceList[dhcpParam.deviceId].ipAddress);
                else ipDeviceElem.val(deviceList[dhcpParam.deviceId].configuration.ipAddress);
                netmaskElem.val(deviceList[dhcpParam.deviceId].configuration.netmask);
                gwDeviceElem.val(deviceList[dhcpParam.deviceId].configuration.gateway);
            }
            dhcpParam.mgt0 = true;
            break;
        case "other":
            gwDeviceElem.prop("disabled", true).removeClass('isNotValid');
            vlanElem.prop("disabled", false);
            dhcpParam.mgt0 = false;
            break;
    }
}


function saveDhcp(prefix) {
    dhcpParam.enable = $("#" + prefix + "-enable-dhcp").hasClass("fa-check-square-o");
    switch (prefix) {
        case 'depl':
            if (dhcpParam.enable && dhcpParam.mgt0) {
                deviceList[dhcpParam.deviceId].cidr = dhcpParam.ipAddress + "/" + dhcpParam.bitmask;
                deviceList[dhcpParam.deviceId].configuration.ipAddress = dhcpParam.ipAddress;
                deviceList[dhcpParam.deviceId].configuration.netmask = dhcpParam.netmask;
                deviceList[dhcpParam.deviceId].configuration.gateway = dhcpParam.gateway;
            }

            displayNetworkParam();
            break;
    }
}

function resumeDhcpParam(prefix) {

    if (dhcpParam.enable) enableDhcp(prefix);
    if (dhcpParam.deviceId) {
        if (dhcpParam.deviceSerial == deviceList[dhcpParam.deviceId].serialNumber) changeDevice(prefix, dhcpParam.deviceId);
    }
    if (dhcpParam.mgt0) {
        changeDhcpInterface(prefix, 'mgt0');
        if (dhcpParam.deviceId) $("#" + prefix + "-gwDevice").val(deviceList[dhcpParam.deviceId].configuration.gateway).addClass('isValid');
    }
    else changeDhcpInterface(prefix, 'other');
    if (dhcpParam.vlanID) $("#" + prefix + "-vlanID").val(dhcpParam.vlanID).addClass('isValid');
    if (dhcpParam.ipAddress != "") $("#" + prefix + "-ipDevice").val(dhcpParam.ipAddress).addClass('isValid');
    if (dhcpParam.netmask != "") $("#" + prefix + "-netmask").val(dhcpParam.netmask).addClass('isValid');
    if (dhcpParam.poolStart != "") $("#" + prefix + "-poolStart").val(dhcpParam.poolStart).addClass('isValid');
    if (dhcpParam.poolEnd != "") $("#" + prefix + "-poolEnd").val(dhcpParam.poolEnd).addClass('isValid');
    if (dhcpParam.options.gateway != "") $("#" + prefix + "-gwDhcp").val(dhcpParam.options.gateway).addClass('isValid');
    if (dhcpParam.options.dns != "") $("#" + prefix + "-dns").val(dhcpParam.options.dns).addClass('isValid');
    if (dhcpParam.options.ntp != "") $("#" + prefix + "-ntp").val(dhcpParam.options.ntp).addClass('isValid');
    if (dhcpParam.options.domain != "") $("#" + prefix + "-domain").val(dhcpParam.options.domain).addClass('isValid');
    saveButtonState(prefix);
}

function dispalyDhcp(prefix) {
    var htmlString =
        '<div style="width: 95%; margin: auto">' +
        '<div class="ui-sec-tle"><h3>DHCP Server</h3></div>' +
        '<div class="dhcp-container">' +
        '<div class="input-group dhcp-checkbox">' +
        '<i class="fa fa-square-o fa-lg" id="' + prefix + '-enable-dhcp" onclick="enableDhcp(\'' + prefix + '\')"> ' +
        '<span class="disabled asat-group-addon">Enable DHCP Server</span>' +
        '</i>' +
        '</div>' +
        '<div class="input-group dhcp-server">' +
        '<span class="dhcp disabled asat-group-addon">Device:</span>' +
        '<span  class="dropdown dhcp">' +
        '<button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="dhcp disabled">' +
        '<span class="list"  id="' + prefix + '-dropdown-device"> Select Device </span>' +
        '<div><span class="caret"></span></div>' +
        '</button>' +
        '<ul class="dropdown-menu scrollable-menu" aria-labelledby="dLabel">';
    for (var i in deviceList) {
        if (deviceList[i].selected) htmlString += '<li onclick="changeDevice(\'' + prefix + '\', \'' + i + '\')"><a href="#">' + deviceList[i].hostname + ' (' + deviceList[i].configuration.ipAddress + ')</a></li>';
    }
    htmlString +=
        '</ul>' +
        '</span><br>' +
        '<span class="dhcp disabled asat-group-addon">VLAN:</span>' +
        '<label class="radio dhcp">' +
        '<input onclick="changeDhcpInterface(\'' + prefix + '\', \'mgt0\')" id="' + prefix + '-mgt0" name="vlan" class="dhcp" disabled="disabled" checked="checked" type="radio">' +
        '<span class="lbl">mgt0</span>' +
        '</label>' +
        '<label class="radio dhcp">' +
        '<input onclick="changeDhcpInterface(\'' + prefix + '\', \'other\')" id="' + prefix + '-mgtx" name="vlan" class="dhcp" disabled="disabled" type="radio">' +
        '<span class="lbl">Other</span>' +
        '</label>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">VLAN ID:</span>' +
        '<input type="text" onchange="checkVlan(\'' + prefix + '\')" onkeypress="return vlanKeyPress(event)" class="form-control vlan" id="' + prefix + '-vlanID" disabled="disabled"/>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="ui-sec-tle"><h3>DHCP Parameters</h3></div>' +
        '<div class="dhcp-container">' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon dhcp">IP Address<span style="color: red">*</span>:</span>' +
        '<input type="text" onchange="checkIpDevice(\'' + prefix + '\')" onkeypress="return ipKeyPress(event)" class="form-control dhcp" id="' + prefix + '-ipDevice" disabled="disabled"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">Netmask<span style="color: red">*</span>:</span>' +
        '<input type="text" onchange="checkNetmask(\'' + prefix + '\')" onkeypress="return ipKeyPress(event)" class="form-control dhcp" id="' + prefix + '-netmask" disabled="disabled"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">Gateway<span style="color: red">*</span>:</span>' +
        '<input type="text" onchange="checkGwDevice(\'' + prefix + '\')" onkeypress="return ipKeyPress(event)" class="form-control dhcp" id="' + prefix + '-gwDevice" disabled="disabled"/>' +
        '</div>' +
        '</div>' +

        '<div class="ui-sec-tle"><h3>IP Pool</h3></div>' +
        '<div class="dhcp-container">' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">Start IP Address<span style="color: red">*</span>:</span>' +
        '<input type="text" onchange="checkPoolStart(\'' + prefix + '\')" class="form-control dhcp" id="' + prefix + '-poolStart" disabled="disabled"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">End IP Address<span style="color: red">*</span>:</span>' +
        '<input type="text" onchange="checkPoolEnd(\'' + prefix + '\')" class="form-control dhcp" id="' + prefix + '-poolEnd" disabled="disabled"/>' +
        '</div>' +
        '</div>' +

        '<div class="ui-sec-tle"><h3>DHCP Options</h3></div>' +
        '<div class="dhcp-container">' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">Default Gateway</span>' +
        '<input type="text" onchange="checkGwDhcp(\'' + prefix + '\')" class="form-control dhcp" id="' + prefix + '-gwDhcp" disabled="disabled"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">DNS Server IP:</span>' +
        '<input type="text" onchange="checkDns(\'' + prefix + '\')" class="form-control dhcp" id="' + prefix + '-dns" disabled="disabled"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">NTP Server IP:</span>' +
        '<input type="text" onchange="checkNtp(\'' + prefix + '\')" class="form-control dhcp" id="' + prefix + '-ntp" disabled="disabled"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">Domain Name:</span>' +
        '<input type="text" onchange="checkDomain(\'' + prefix + '\')" class="form-control dhcp" id="' + prefix + '-domain" disabled="disabled"/>' +
        '</div>' +
        '</div></div>'
    ;
    document.getElementById(prefix + "-window").innerHTML = htmlString;
    document.getElementById(prefix + "-action").innerHTML =
        '<button id="' + prefix + '-button-back" class="back btn btn-default" onclick="displayNetworkParam()">Back</button>' +
        '<button id="' + prefix + '-button-next" class="next btn btn-default" onclick="saveDhcp(\'' + prefix + '\')">Save</button>';
    resumeDhcpParam(prefix);
}
