var dhcpParam = {
    enable: false,
    deviceId: null,
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
    var gwDeviceElem = $("#" + prefix + "-gwDevice");
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");

    if (dhcpParam.ipAddress != "" && dhcpParam.netmask != "") {
        var block = new Netmask(dhcpParam.ipAddress + "/" + dhcpParam.netmask);
        if (block) {
            if (dhcpParam.mgt0 && (dhcpParam.gateway != "" && !block.contains(dhcpParam.gateway))) {
                gwDeviceElem.addClass('isNotValid').removeClass('isValid');
                displayQtip(prefix + "-gwDevice", "Gateway IP Address does not belong to the DHCP server subnet.", null, null, null);
            }
            if (dhcpParam.poolStart != "" && !block.contains(dhcpParam.poolStart) || (dhcpParam.poolEnd != "" && !block.contains(dhcpParam.poolEnd))) {
                poolStartElem.addClass('isNotValid').removeClass('isValid');
                displayQtip(prefix + "-poolStart", "DHCP IP Pool does not belong to the DHCP server subnet.", null, null, null);
            }
            if (dhcpParam.options.gateway != "" && !block.contains(dhcpParam.options.gateway)) {
                poolEndElem.addClass('isNotValid').removeClass('isValid');
                displayQtip(prefix + "-poolStart", "Gateway IP Address does not belong to the DHCP server subnet.", null, null, null);
            }
            dhcpParam.bitmask = block.bitmask;


        }
    }
}

function checkDhcpInput(prefix) {
    var isValid = true;

    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var netmaskElem = $("#" + prefix + "-netmask");
    var gwDeviceElem = $("#" + prefix + "-gwDevice");
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");
    var gwDhcpElem = $("#" + prefix + "-gwDhcp");
    var dnsElem = $("#" + prefix + "-dns");
    var ntpElem = $("#" + prefix + "-ntp");

    if (ipDeviceElem.hasClass("isValid")
        && netmaskElem.hasClass("isValid")
        && (!dhcpParam.mgt0 || gwDeviceElem.hasClass("isValid"))
        && poolStartElem.hasClass("isValid")
        && poolEndElem.hasClass("isValid")
    ) {

        if (dhcpParam.mgt0 && (ipDeviceElem.val() == gwDeviceElem.val())) {
            ipDeviceElem.removeClass("isValid").addClass("isNotValid");
            gwDeviceElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-ipDevice", "Device IP Address and Gateway IP Address can't be the same.", null, null, null);
            displayQtip(prefix + "-gwDevice", "Device IP Address and Gateway IP Address can't be the same.", null, null, null);
            isValid = false;
        } else {
            ipDeviceElem.addClass("isValid").removeClass("isNotValid");
            gwDeviceElem.addClass("isValid").removeClass("isNotValid");
        }

        if (isValid && ipDeviceElem.val() >= poolStartElem.val() && ipDeviceElem.val() <= poolEndElem.val()) {
            ipDeviceElem.removeClass("isValid").addClass("isNotValid");
            poolStartElem.removeClass("isValid").addClass("isNotValid");
            poolEndElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-ipDevice", "DHCP server IP Address can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolStart", "DHCP server IP Address can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolEnd", "DHCP server IP Address can't be included into DHCP Pool.", null, null, null);
            isValid = false;
        } else {
            ipDeviceElem.addClass("isValid").removeClass("isNotValid");
            poolStartElem.addClass("isValid").removeClass("isNotValid");
            poolEndElem.addClass("isValid").removeClass("isNotValid");
        }

        if (isValid && dhcpParam.mgt0 && (gwDeviceElem.val() >= poolStartElem.val() && gwDeviceElem.val() <= poolEndElem.val())) {
            gwDeviceElem.removeClass("isValid").addClass("isNotValid");
            poolStartElem.removeClass("isValid").addClass("isNotValid");
            poolEndElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-ipDevice", "Gateway IP can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolStart", "Gateway IP can't be included into DHCP Pool.", null, null, null);
            displayQtip(prefix + "-poolEnd", "Gateway IP can't be included into DHCP Pool.", null, null, null);
            isValid = false;
        } else {
            gwDeviceElem.addClass("isValid").removeClass("isNotValid");
            poolStartElem.addClass("isValid").removeClass("isNotValid");
            poolEndElem.addClass("isValid").removeClass("isNotValid");
        }

        if (isValid && poolStartElem.val() >= poolEndElem.val()) {
            poolStartElem.removeClass("isValid").addClass("isNotValid");
            poolEndElem.removeClass("isValid").addClass("isNotValid");
            displayQtip(prefix + "-poolStart", "DHCP Pool is not valid. Please change IP Start or IP End.", null, null, null);
            displayQtip(prefix + "-poolEnd", "DHCP Pool is not valid. Please change IP Start or IP End.", null, null, null);
            isValid = false;
        } else {
            poolStartElem.addClass("isValid").removeClass("isNotValid");
            poolEndElem.addClass("isValid").removeClass("isNotValid");
        }


        if (gwDhcpElem.val() != '') {
            if (isValid && gwDhcpElem.val() == ipDeviceElem.val()) {
                ipDeviceElem.removeClass("isValid").addClass("isNotValid");
                gwDhcpElem.removeClass("isValid").addClass("isNotValid");
                displayQtip(prefix + "-ipDevice", "Device IP Address and Gateway IP Address can't be the same.", null, null, null);
                displayQtip(prefix + "-gwDhcp", "Device IP Address and Gateway IP Address can't be the same.", null, null, null);
                isValid = false;
            } else {
                ipDeviceElem.addClass("isValid").removeClass("isNotValid");
                gwDhcpElem.addClass("isValid").removeClass("isNotValid");
            }

            if (isValid && gwDhcpElem.val() >= poolStartElem.val() && gwDhcpElem.val() <= poolEndElem.val()) {
                gwDhcpElem.removeClass("isValid").addClass("isNotValid");
                poolStartElem.removeClass("isValid").addClass("isNotValid");
                poolEndElem.removeClass("isValid").addClass("isNotValid");
                displayQtip(prefix + "-gwDhcp", "Gateway IP Address can't be included into DHCP Pool.", null, null, null);
                displayQtip(prefix + "-poolStart", "Gateway IP Address can't be included into DHCP Pool.", null, null, null);
                displayQtip(prefix + "-poolEnd", "Gateway IP Address can't be included into DHCP Pool.", null, null, null);
                isValid = false;
            } else {
                gwDeviceElem.addClass("isValid").removeClass("isNotValid");
                poolStartElem.addClass("isValid").removeClass("isNotValid");
                poolEndElem.addClass("isValid").removeClass("isNotValid");
            }
        }


        if (isValid && dnsElem.val() != '') {
            if (dnsElem.val() == ipDeviceElem.val()) {
                dnsElem.removeClass("isValid").addClass("isNotValid");
                ipDeviceElem.removeClass("isValid").addClass("isNotValid");
                displayQtip(prefix + "-ipDevice", "Device IP Address and DNS IP Address can't be the same.", null, null, null);
                displayQtip(prefix + "-dns", "Device IP Address and DNS IP Address can't be the same.", null, null, null);
                isValid = false;
            } else {
                ipDeviceElem.addClass("isValid").removeClass("isNotValid");
                dnsElem.addClass("isValid").removeClass("isNotValid");
            }

            if (isValid && dnsElem.val() >= poolStartElem.val() && dnsElem.val() <= poolEndElem.val()) {
                dnsElem.removeClass("isValid").addClass("isNotValid");
                poolStartElem.removeClass("isValid").addClass("isNotValid");
                poolEndElem.removeClass("isValid").addClass("isNotValid");
                displayQtip(prefix + "-dns", "DNS IP Address can't be included into DHCP Pool.", null, null, null);
                displayQtip(prefix + "-poolStart", "DNS IP Address can't be included into DHCP Pool.", null, null, null);
                displayQtip(prefix + "-poolEnd", "DNS IP Address can't be included into DHCP Pool.", null, null, null);
                isValid = false;
            } else {
                dnsElem.addClass("isValid").removeClass("isNotValid");
                poolStartElem.addClass("isValid").removeClass("isNotValid");
                poolEndElem.addClass("isValid").removeClass("isNotValid");
            }
        }


        if (ntpElem.val() != '') {
            if (isValid && ntpElem.val() == ipDeviceElem.val()) {
                ntpElem.removeClass("isValid").addClass("isNotValid");
                ipDeviceElem.removeClass("isValid").addClass("isNotValid");
                displayQtip(prefix + "-ipDevice", "Device IP Address and NTP IP Address/Hostname can't be the same.", null, null, null);
                displayQtip(prefix + "-ntp", "Device IP Address and NTP IP Address/Hostname can't be the same.", null, null, null);
                isValid = false;
            } else {
                ipDeviceElem.addClass("isValid").removeClass("isNotValid");
                ntpElem.addClass("isValid").removeClass("isNotValid");
            }

            if (isValid && ntpElem.val() >= poolStartElem.val() && ntpElem.val() <= poolEndElem.val()) {
                ntpElem.removeClass("isValid").addClass("isNotValid");
                poolStartElem.removeClass("isValid").addClass("isNotValid");
                poolEndElem.removeClass("isValid").addClass("isNotValid");
                displayQtip(prefix + "-nt", "NTP IP Address/Hostname can't be included into DHCP Pool.", null, null, null);
                displayQtip(prefix + "-poolStart", "NTP IP Address/Hostname can't be included into DHCP Pool.", null, null, null);
                displayQtip(prefix + "-poolEnd", "NTP IP Address/Hostname can't be included into DHCP Pool.", null, null, null);
                isValid = false;
            } else {
                ntpElem.addClass("isValid").removeClass("isNotValid");
                poolStartElem.addClass("isValid").removeClass("isNotValid");
                poolEndElem.addClass("isValid").removeClass("isNotValid");
            }
        }
    }
}



function dhcpInputChange(prefix, elem, value) {
    var deviceElem = $("#" + prefix + "-dropdown-device");
    var mgt0Elem = $("#" + prefix + "-mgt0");
    var vlanElem = $("#" + prefix + "-vlanID");
    var ipDeviceElem = $("#" + prefix + "-ipDevice");
    var netmaskElem = $("#" + prefix + "-netmask");
    var gwDeviceElem = $("#" + prefix + "-gwDevice");
    var poolStartElem = $("#" + prefix + "-poolStart");
    var poolEndElem = $("#" + prefix + "-poolEnd");
    var gwDhcpElem = $("#" + prefix + "-gwDhcp");
    var dnsElem = $("#" + prefix + "-dns");
    var ntpElem = $("#" + prefix + "-ntp");
    var domainElem = $("#" + prefix + "-domain");
    var saveButton = $("#" + prefix + "-button-next");

    $(".qtip").each(function () {
        var api = $(this).qtip('api');
        api.destroy();
    });


    if (elem == 'device') {
        var device = deviceList[value];
        dhcpParam.deviceId = value;
        if (mgt0Elem.prop("checked")) {
            deviceElem.html(device.hostname + ' (' + device.ipAddress + ')');
            vlanElem.val(device.configuration.mgmtVlan);
            if (device.configuration.ipAddress != "") ipDeviceElem.val(device.configuration.ipAddress);
            else ipDeviceElem.val(device.ipAddress);
            if (device.configuration.netmask != "") netmaskElem.val(device.configuration.netmask);
            if (device.configuration.gateway != "") netmaskElem.val(device.configuration.gateway);
        }
    }
    if (vlanElem.val() >= 0 && vlanElem.val() <= 4095) {
        vlanElem.addClass("isValid").removeClass("isNotValid");
        dhcpParam.vlanID = vlanElem.val();
    } else vlanElem.addClass('isNotValid').removeClass('isValid');

    if (validateIP(ipDeviceElem.val())) {
        ipDeviceElem.addClass("isValid").removeClass("isNotValid");
        dhcpParam.ipAddress = ipDeviceElem.val();
    } else ipDeviceElem.addClass('isNotValid').removeClass('isValid');

    if (validateIP(netmaskElem.val())) {
        netmaskElem.addClass("isValid").removeClass("isNotValid");
        dhcpParam.netmask = netmaskElem.val();
    } else netmaskElem.addClass('isNotValid').removeClass('isValid');

    if (dhcpParam.mgt0 && validateIP(gwDeviceElem.val())) {
        gwDeviceElem.addClass("isValid").removeClass("isNotValid");
        dhcpParam.gateway = gwDeviceElem.val();
    } else gwDeviceElem.addClass('isNotValid').removeClass('isValid');

    if (validateIP(poolStartElem.val())) {
        dhcpParam.poolStart = poolStartElem.val();
        poolStartElem.addClass("isValid").removeClass("isNotValid");
    } else poolStartElem.addClass('isNotValid').removeClass('isValid');

    if (validateIP(poolEndElem.val())) {
        dhcpParam.poolEnd = poolEndElem.val();
        poolEndElem.addClass("isValid").removeClass("isNotValid");
    } else poolEndElem.addClass('isNotValid').removeClass('isValid');

    if (validateIP(gwDhcpElem.val()) || ntpElem.val() == "") {
        gwDhcpElem.addClass("isValid").removeClass("isNotValid");
        dhcpParam.options.gateway = gwDhcpElem.val();
    } else gwDhcpElem.addClass('isNotValid').removeClass('isValid');

    if (validateIP(dnsElem.val()) || ntpElem.val() == "") {
        dnsElem.addClass("isValid").removeClass("isNotValid");
        dhcpParam.options.dns = dnsElem.val();
    } else dnsElem.addClass('isNotValid').removeClass('isValid');

    if (validateIP(ntpElem.val()) || validateFQDN(ntpElem.val()) || ntpElem.val() == "") {
        ntpElem.addClass("isValid").removeClass("isNotValid");
        dhcpParam.options.ntp = ntpElem.val();
    } else ntpElem.addClass('isNotValid').removeClass('isValid');

    dhcpParam.options.domain = domainElem.val();

    checkBlock(prefix);
    checkDhcpInput(prefix);
    if ($(".dhcp.isNotValid").length == 0
        && $(".vlan.isNotValid").length == 0
    ) saveButton.prop("disabled", false);
    else saveButton.prop("disabled", true);
}

function enableDhcp(prefix) {
    var enableDhcpElem = $("#" + prefix + "-enable-dhcp");
    if (enableDhcpElem.hasClass("fa-square-o")) {
        enableDhcpElem.removeClass("fa-square-o").addClass('fa-check-square-o');
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
        enableDhcpElem.addClass("fa-square-o").addClass('fa-check-square-o');
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
}

function changeDhcpInterface(prefix, mgt) {
    switch (mgt) {
        case "mgt0":
            $("#" + prefix + "-vlanID").prop("disabled", true);
            $("#" + prefix + "-gwDevice").prop("disabled", false);
            if (dhcpParam.deviceId) {
                if (deviceList[dhcpParam.deviceId].configuration.ipAddress == "") $("#" + prefix + "-ipDevice").val(deviceList[dhcpParam.deviceId].ipAddress);
                else $("#" + prefix + "-ipDevice").val(deviceList[dhcpParam.deviceId].configuration.ipAddress);
                $("#" + prefix + "-netmask").val(deviceList[dhcpParam.deviceId].configuration.netmask);
                $("#" + prefix + "-gwDevice").val(deviceList[dhcpParam.deviceId].configuration.gateway);
            } else {
                $("#" + prefix + "-ipDevice").val("");
                $("#" + prefix + "-netmask").val("");
                $("#" + prefix + "-gwDevice").val("");
            }
            dhcpParam.mgt0 = true;
            break;
        case "other":
            $("#" + prefix + "-ipDevice").val("");
            $("#" + prefix + "-netmask").val("");
            $("#" + prefix + "-gwDevice").val("").prop("disabled", true).removeClass('isNotValid');
            $("#" + prefix + "-vlanID").prop("disabled", false);
            dhcpParam.mgt0 = false;
            break;
    }
}


function saveDhcp(prefix) {
    dhcpParam.enable = true;
    console.log(dhcpParam);
    switch (prefix) {
        case 'depl':
            if (dhcpParam.mgt0) {
                deviceList[dhcpParam.deviceId].cidr = dhcpParam.ipAddress + "/" + dhcpParam.bitmask;
                deviceList[dhcpParam.deviceId].ipAddress = dhcpParam.ipAddress;
                deviceList[dhcpParam.deviceId].netmask = dhcpParam.netmask;
                deviceList[dhcpParam.deviceId].gateway = dhcpParam.gateway;
            }

            displayCommonParam();
            break;
    }
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
        if (deviceList[i].selected) htmlString += '<li onclick="dhcpInputChange(\'' + prefix + '\', \'device\', \'' + i + '\')"><a href="#">' + deviceList[i].hostname + ' (' + deviceList[i].ipAddress + ')</a></li>';
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
        '<input type="text" onchange="dhcpInputChange(\'' + prefix + '\', \'vlanID\')" onkeypress="return vlanKeyPress(event)" class="form-control vlan" id="' + prefix + '-vlanID" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="ui-sec-tle"><h3>DHCP Parameters</h3></div>' +
        '<div class="dhcp-container">' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon dhcp">IP Address<span style="color: red">*</span>:</span>' +
        '<input type="text" onchange="dhcpInputChange(\'' + prefix + '\', \'ipDevice\')" onkeypress="return ipKeyPress(event)" class="form-control dhcp" id="' + prefix + '-ipDevice" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">Netmask<span style="color: red">*</span>:</span>' +
        '<input type="text" onchange="dhcpInputChange(\'' + prefix + '\', \'netmask\')" onkeypress="return ipKeyPress(event)" class="form-control dhcp" id="' + prefix + '-netmask" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">Gateway<span style="color: red">*</span>:</span>' +
        '<input type="text" onchange="dhcpInputChange(\'' + prefix + '\', \'gwDevice\')" onkeypress="return ipKeyPress(event)" class="form-control dhcp" id="' + prefix + '-gwDevice" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '</div>' +

        '<div class="ui-sec-tle"><h3>IP Pool</h3></div>' +
        '<div class="dhcp-container">' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">Start IP Address<span style="color: red">*</span>:</span>' +
        '<input type="text" onchange="dhcpInputChange(\'' + prefix + '\', \'poolStart\')" class="form-control dhcp" id="' + prefix + '-poolStart" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">End IP Address<span style="color: red">*</span>:</span>' +
        '<input type="text" onchange="dhcpInputChange(\'' + prefix + '\', \'poolEnd\')" class="form-control dhcp" id="' + prefix + '-poolEnd" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '</div>' +

        '<div class="ui-sec-tle"><h3>DHCP Options</h3></div>' +
        '<div class="dhcp-container">' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">Default Gateway</span>' +
        '<input type="text" onchange="dhcpInputChange(\'' + prefix + '\', \'gwDhcp\')" class="form-control dhcp" id="' + prefix + '-gwDhcp" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">DNS Server IP:</span>' +
        '<input type="text" onchange="dhcpInputChange(\'' + prefix + '\', \'dns\')" class="form-control dhcp" id="' + prefix + '-dns" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">NTP Server IP:</span>' +
        '<input type="text" onchange="dhcpInputChange(\'' + prefix + '\', (\'ntp\')" class="form-control dhcp" id="' + prefix + '-ntp" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '<div class="input-group dhcp">' +
        '<span class="input-group-addon">Domain Name:</span>' +
        '<input type="text" onchange="dhcpInputChange(\'' + prefix + '\', \'domain\')" class="form-control dhcp" id="' + prefix + '-domain" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '</div></div>'
    ;
    document.getElementById(prefix + "-window").innerHTML = htmlString;
    document.getElementById(prefix + "-action").innerHTML =
        '<button id="' + prefix + '-button-back" class="back btn btn-default" onclick="displayNetworkParam()">Back</button>' +
        '<button id="' + prefix + '-button-next" class="next btn btn-default"  onclick="saveDhcp(\'' + prefix + '\')" >Save</button>';
}
