var db = require("./libs/sqlite.main");

var Netmask = require("netmask").Netmask;


var Discover = require("./libs/deployment.discover");
var Deploy = require("./libs/deployment.deploy");
var Device = require('./libs/aerohive.device');


var credentials = {
    login: "admin",
    password: "aerohive"
};

var network = null;
var deviceList = [];
var countryList = {};
var htmlString = "";

var commonParam = {
    region: {
        enable: false,
        value: "World"
    },
    country: {
        enable: false,
        value: "250"
    },
    dns: {
        enable: false,
        value: "8.8.8.8"
    },
    ntp: {
        enable: false,
        value: "0.pool.ntp.org"
    },
    capwap: {
        enable: false,
        configured: true,
        server: "redirector.aerohive.com",
        port: 12222,
        http: {
            enable: false,
            configured: true,
            proxy: {
                enable: false,
                configured: true,
                host: "",
                port: 8080,
                auth: {
                    enable: false,
                    configured: true,
                    user: "",
                    password: ""
                }
            }
        }
    },
    save: {
        enable: false
    },
    reboot: {
        enable: false
    }
};


/* =================================================
 ============ Deployment locate Devices ============
 =================================================== */

function initDeployment() {
    if (network == null) {
        var os = require('os');
        var interfaces = os.networkInterfaces();
        var addresses = [];
        for (var k in interfaces) {
            for (var k2 in interfaces[k]) {
                var address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    var cidr = address.address + "/" + address.netmask;
                    var block = new Netmask(cidr);
                    addresses.push(block.base + "/" + block.bitmask);
                }
            }
        }
        network =  addresses[0];
    }
    db.CountryCode.getArray(function (res) {
        countryList = res;
        displayDeployment();
        //displayCommonParam();
        //displayNetworkParam();
    })
}


/* =================================================
 ======================= 1/4 =======================
 =================================================== */

var deviceNumber = 0;
var deviceCount = 0;
var discoverProcess = 0;
messenger.on("depl discover start", function (process, devCount) {
    deviceCount = devCount;
    deviceNumber = 0;
}).on("depl discover ip error", function (process) {
    if (discoverProcess == process) {
        deviceNumber++;
        var percent = (deviceNumber / deviceCount) * 100;
        $('.progress-bar').css('width', percent.toFixed(1) + '%').attr('aria-valuenow', percent.toFixed(1)).text(deviceNumber + "/" + deviceCount);
    }
}).on("depl discover ip done", function (process, device) {
    if (discoverProcess == process) {
        deviceNumber++;
        var percent = (deviceNumber / deviceCount) * 100;
        if (device) newDevice(device);
        $('.progress-bar').css('width', percent.toFixed(1) + '%').attr('aria-valuenow', percent.toFixed(1)).text(deviceNumber + "/" + deviceCount);
    }
}).on('depl discover stop', function () {
    $('.progress-bar').css('width', '100%').text("Stopping test...").addClass("progress-bar-danger");
    $("#find-stop").prop("disabled", true);
}).on('depl discover end', function (process) {
    if (discoverProcess == process) {
        $('.progress-bar').css('width', '100%').attr('aria-valuenow', deviceCount + "/" + deviceCount);
        $("#find-start").prop("disabled", false);
        $("#find-stop").prop("disabled", true);
        $("#find-clear").prop("disabled", false);
    }
});

function displayDeployment() {
    if (htmlString == "" || $("#depl").is(":visible")){
        // change the breadcrumb status
        $(".depl-button").removeClass("fa-circle").addClass("fa-circle-o");
        $("#depl-find").removeClass("fa-circle-o").addClass("fa-circle");
        // create HTML
        htmlString = '<div style="width: 100%; overflow: hidden;">' +
            '<div class="input-group" style="width: 40%; float: left">' +
            '<span class="input-group-addon"">Network:</span>' +
            '<input type="text" onkeypress="return networkKeyPress(event)" onchange="changeNetDisco()" class="form-control" value="' + network + '" id="network"/>' +
            '</div>' +
            '<div class="input-group" style="width: 40%; margin: auto">' +
            '<span class="input-group-addon" >Password:</span>' +
            '<input type="password" class="form-control" value="' + credentials.password + '" id="password"/>' +
            '</div>' +
            '</div>' +
            "<hr>" +
            '<div style="width:100%;">' +
            "<div id='progress-bar' class='progress depl'>" +
            "<div class='progress-bar' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100'>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "<hr>" +
            "<button id='find-start' onclick='startDiscovery()' class='btn btn-default update'>Start</button>" +
            "<button id='find-stop' onclick='stopDiscovery()' class='btn btn-default update' disabled='disabled'>Stop</button>" +
            "<button id='find-clear' onclick='clearDiscovery()' class='btn btn-default update'>Clear</button>" +
            "<button id='find-select' onclick='selectAllDiscovery()' class='btn btn-default update' disabled='disabled'>Select All</button>" +
            "<button id='find-unselect' onclick='unselectAllDiscovery()' class='btn btn-default update' disabled='disabled'>Unselect All</button>" +
            "<table class='table asat-table'>" +
            "<thead>" +
            "<tr>" +
            "<th>IP Address</th>" +
            "<th>Hostname</th>" +
            "<th>Type</th>" +
            "<th>Serial Number</th>" +
            "<th>MAC Address</th>" +
            "<th>Comment</th>" +
            "</tr>" +
            "</thead>" +
            "<tbody id='table-depl'>" +
            "" +
            "</tbody>" +
            "</table>";
        document.getElementById("depl-window").innerHTML = htmlString;
        document.getElementById("depl-action").innerHTML =
                '<button id="depl-button-next" class="next btn btn-default" disabled="disabled"  onclick="displayCommonParam()" >Next</button>';
        displayDevices();
    }
}

function displayDevices() {
    if (deviceList.length == 0) {
        $('#find-select').prop("disabled", true);
        $('#find-unselect').prop("disabled", true);
    } else {
        $('#find-select').prop("disabled", false);
        $('#find-unselect').prop("disabled", false);
    }
    var htmlString = "";
    for (var i in deviceList) {
        var rowClass = "";
        if (deviceList[i].isValid) {
            if (deviceList[i].selected == true) rowClass = "selected";
            htmlString += '<tr id="device-' + i + '" class="' + rowClass + '" onclick="selectDevice(\'' + i + '\')">';
        } else {
            htmlString += '<tr id="device-' + i + '" class="' + rowClass + ' isNotValid">';
        }
        htmlString +=
            '<td>' + deviceList[i].ipAddress + '</td>' +
            '<td>' + deviceList[i].hostname + '</td>' +
            '<td>' + deviceList[i].deviceType + '</td>' +
            '<td>' + deviceList[i].serialNumber + '</td>' +
            '<td>' + deviceList[i].macAddress + '</td>' +
            '<td>' + deviceList[i].comment + '</td>' +
            '</tr>';
    }
    $('#table-depl').html(htmlString);
    nextButtonState();
}
function startDiscovery() {
    $('.progress-bar').removeClass("progress-bar-danger");
    $("#find-start").prop("disabled", true);
    $("#find-stop").prop("disabled", false);
    $("#find-clear").prop("disabled", true);
    discoverProcess++;
    var cidr = $('#network').val();
    credentials.password = $('#password').val();
    Discover.discover(discoverProcess, cidr, credentials, 10, asatConsole, messenger);
}
function stopDiscovery() {
    messenger.emit("depl discover stop");
}
function clearDiscovery() {
    deviceList = [];
    displayDevices();
}

function selectAllDiscovery() {
    for (var i in deviceList) {
        if (deviceList[i].isValid) deviceList[i].selected = true;
    }
    nextButtonState(true);
    displayDevices();
}
function unselectAllDiscovery() {
    for (var i in deviceList) {
        deviceList[i].selected = false;
    }
    nextButtonState(false);
    displayDevices();
}
function nextButtonState(newState) {
    if (newState == true) $("#depl-button-next").prop('disabled', false);
    else if (newState == false) $("#depl-button-next").prop('disabled', true);
    else {
        if ($('tr.selected').length == 0) $("#depl-button-next").prop('disabled', true);
        else $("#depl-button-next").prop('disabled', false);
    }
}
function sortIp(deviceA, deviceB) {
    if (deviceA.ipAddress > deviceB.ipAddress) return 1;
    else if (deviceA.ipAddress < deviceB.ipAddress) return -1;
    else {
        if (deviceA.ipAddress > deviceB.ipAddress) return 1;
        else if (deviceA.ipAddress < deviceB.ipAddress) return -1;
        else return 0;
    }
}

function newDevice(device) {
    var isNew = true;
    for (var i in deviceList) {
        if (deviceList[i].ipAddress == device.ipAddress) {
            deviceList[i] = device;
            isNew = false;
            break;
        }
    }
    if (isNew) {
        deviceList.push(device);
        deviceList.sort(sortIp);
    }
    displayDevices();
}

function selectDevice(i) {
    if (deviceList.hasOwnProperty(i)) {
        var device = $("#device-" + i);
        if (device.hasClass("selected")) {
            device.removeClass("selected");
            deviceList[i].selected = false;
            nextButtonState();
        }
        else {
            device.addClass("selected");
            deviceList[i].selected = true;
            nextButtonState();
        }
    }

}

function changeNetDisco() {
    var elem = $('#network');
    var isValid = false;
    var networkSplitted = elem.val().split("/");
    if (networkSplitted.length == 2) {
        var ip = networkSplitted[0];
        var mask = networkSplitted[1];
        if (validateIP(ip)) {
            if (mask != "" && mask >= 0 && mask <= 32) {
                isValid = true;
            }
        }
    }
    if (isValid) {
        network = elem.val();
        elem.removeClass("isNotValid");
        $("#find-start").prop("disabled", false);
    } else {
        elem.addClass("isNotValid");
        $("#find-start").prop("disabled", true);
    }
}

/* =================================================
 ======================= 2/4 =======================
 =================================================== */
function displayCommonParam() {
    // change the breadcrumb status
    $(".depl-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#depl-common").removeClass("fa-circle-o").addClass("fa-circle");

    htmlString =
        '<div style="width: 85%; margin: auto">' +
        "<div class='ui-sec-tle'><h3>Radio</h3></div>" +

        '<div class="region">' +
        '<i class="fa fa-square-o fa-lg depl" id="region" onclick="deplEnableParam(\'region\')"> ' +
        '<span class="region disabled asat-group-addon">Region: </span>' +
        '</i>' +
        '<span  class="dropdown depl">' +
        '<button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="disabled region">' +
        '<span class="list"  id="dropdown-region">' + commonParam.region.value + '</span>' +
        '<div><span class="caret"></span></div>' +
        '</button>' +
        '<ul class="dropdown-menu" aria-labelledby="dLabel">' +
        '<li onclick="dropdownChange(\'region\', \'FCC\')"><a href="#">FCC</a></li>' +
        '<li onclick="dropdownChange(\'region\', \'World\')"><a href="#">World</a></li>' +
        '</ul>' +
        '</span>' +
        '</div>' +

        '<div class="country">' +
        '<i class="fa fa-square-o fa-lg depl" id="country" onclick="deplEnableParam(\'country\')"> ' +
        '<span class="country disabled asat-group-addon">Country Code: </span>' +
        '</i>' +
        '<span  class="dropdown depl">' +
        '<button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="disabled country">' +
        '<span class="list"  id="dropdown-country">' + countryList[commonParam.country.value] + '</span>' +
        '<div><span class="caret"></span></div>' +
        '</button>' +
        '<ul class="dropdown-menu scrollable-menu" aria-labelledby="dLabel">';
    for (var i in countryList) htmlString += '<li onclick="dropdownChange(\'country\', \'' + i + '\')"><a href="#">' + countryList[i] + ' (' + i + ')</a></li>';

    htmlString +=
        '</ul>' +
        '</span>' +
        '</div>' +

        "<div class='ui-sec-tle'><h3>Network</h3></div>" +

        '<div class="dns">' +
        '<i class="fa fa-square-o fa-lg depl" id="dns" onclick="deplEnableParam(\'dns\')"> ' +
        '<span class="dns disabled asat-group-addon">DNS</span>' +
        '</i>' +
        '<div class="input-group depl">' +
        '<span class="input-group-addon" >Server IP :</span>' +
        '<input type="text" onchange="inputChange(\'dns\')" onkeypress="return ipKeyPress(event)" class="form-control dns" id="dns-host" disabled="disabled" value="' + commonParam.dns.value + '"/>' +
        '</div>' +
        '</div>' +

        '<div class="ntp">' +
        '<i class="fa fa-square-o fa-lg depl" id="ntp" onclick="deplEnableParam(\'ntp\')"> ' +
        '<span class="ntp disabled asat-group-addon">NTP Server</span>' +
        '</i>' +
        '<div class="input-group depl">' +
        '<span class="input-group-addon" >Server IP/Hostname :</span>' +
        '<input type="text" onchange="inputChange(\'ntp\')" class="form-control ntp" id="ntp-host" disabled="disabled" value="' + commonParam.ntp.value + '"/>' +
        '</div>' +
        '</div>' +

        "<div class='ui-sec-tle'><h3>CAPWAP</h3></div>" +

        '<div class="capwap">' +
        '<i class="fa fa-square-o fa-lg depl" id="capwap" onclick="deplEnableParam(\'capwap\')"> ' +
        '<span class="capwap disabled asat-group-addon">CAPWAP Server</span>' +
        '</i>' +
        '<span class="controls">' +
        '<input name="services-field-1" class="ace-switch ace-switch-8" id="switch-capwap" type="checkbox" disabled="disabled" checked="checked" onchange="deplSwictchChange(\'capwap\')">' +
        '<span class="lbl switch-label"></span>' +
        '</span>' +
        '<div class="input-group depl first">' +
        '<span class="input-group-addon" >Server IP/Hostname :</span>' +
        '<input type="text" onchange="inputChange(\'capwap-server\')" class="form-control switch-capwap" id="capwap-server" disabled="disabled" value="' + commonParam.capwap.server + '"/>' +
        '</div>' +
        '<div class="input-group depl first">' +
        '<span class="input-group-addon" >Port :</span>' +
        '<input type="text" class="switch-capwap form-control"  onchange="inputChange(\'capwap-port\')" onkeypress="return portKeyPress(\'capwap-port\', event)" id="capwap-port" disabled="disabled" value="' + commonParam.capwap.port + '"/>' +
        '</div>' +
        '</div>' +


        '<div class="http">' +
        '<i class="fa fa-square-o fa-lg depl" id="http" onclick="deplEnableParam(\'http\')"> ' +
        '<span class="capwap disabled asat-group-addon">HTTP Encapsulation</span>' +
        '</i>' +
        '<span class="controls">' +
        '   <input name="ace-switch-http" class="ace-switch ace-switch-7" id="switch-http" type="checkbox" disabled="disabled" checked="checked" onchange="deplSwictchChange(\'http\')">' +
        '<span class="lbl switch-label"></span>' +
        '</span>' +
        '</div>' +


        '<div class="proxy">' +
        '<i class="fa fa-square-o fa-lg depl" id="proxy" onclick="deplEnableParam(\'proxy\')"> ' +
        '<span class="capwap disabled asat-group-addon">CAPWAP Proxy</span>' +
        '</i>' +
        '<span class="controls">' +
        '<input name="ace-switch-proxy" class="ace-switch ace-switch-7" id="switch-proxy" type="checkbox" disabled="disabled" checked="checked" onchange="deplSwictchChange(\'proxy\')">' +
        '<span class="lbl switch-label"></span>' +
        '</span>' +
        '<div class="input-group depl first">' +
        '<span class="input-group-addon">Host:</span>' +
        '<input type="text" onchange="inputChange(\'proxy-host\')" class="form-control switch-proxy" id="proxy-host" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '<div class="input-group depl first">' +
        '<span class="input-group-addon">Port:</span>' +
        '<input type="text" onchange="inputChange(\'proxy-port\')" size="5" class="form-control switch-proxy" onkeypress="return portKeyPress(\'proxy-port\', event)" id="proxy-port" disabled="disabled" value="' + commonParam.capwap.http.proxy.port + '"/>' +
        '</div>' +
        '</div>' +

        '<div class="proxy-auth">' +
        '<i class="fa fa-square-o fa-lg depl" id="proxy-auth" onclick="deplEnableParam(\'proxy-auth\')"> ' +
        '<span class="capwap disabled asat-group-addon">Proxy Authentication</span>' +
        '</i>' +
        '<span class="controls">' +
        '<input name="ace-switch-proxy-auth" class="ace-switch ace-switch-7" id="switch-proxy-auth" type="checkbox" disabled="disabled" checked="checked" onchange="deplSwictchChange(\'proxy-auth\')">' +
        '<span class="lbl switch-label"></span>' +
        '</span>' +
        '<div class="input-group depl first">' +
        '<span class="input-group-addon">Username:</span>' +
        '<input type="text" onchange="inputChange(\'proxy-user\')" class="form-control switch-proxy-auth" id="proxy-user" disabled="disabled" value="' + commonParam.capwap.http.proxy.auth.user + '"/>' +
        '</div>' +
        '<div class="input-group depl first">' +
        '<span class="input-group-addon">Password:</span>' +
        '<input type="password" onchange="inputChange(\'proxy-password\')" class="form-control switch-proxy-auth" id="proxy-password" disabled="disabled" value="' + commonParam.capwap.http.proxy.auth.password + '"/>' +
        '</div>' +
        '</div>' +


        "<div class='ui-sec-tle'><h3>System</h3></div>" +

        '<div class="save">' +
        '<i class="fa fa-square-o fa-lg depl" id="save" onclick="deplEnableParam(\'save\')"> ' +
        '<span class="capwap disabled asat-group-addon">Save Configuration (Persistent after reboot)</span>' +
        '</i>' +
        '</div>' +
        '<div class="reboot">' +
        '<i class="fa fa-square-o fa-lg depl" id="reboot" onclick="deplEnableParam(\'reboot\')"> ' +
        '<span class="capwap disabled asat-group-addon">Reboot Device</span>' +
        '</i>' +
        '</div>' +
        '</div>';
    document.getElementById("depl-window").innerHTML = htmlString;
    resumeParam();
    document.getElementById("depl-action").innerHTML =
        '<button id="button-back" class="back btn btn-default" onclick="displayDeployment()">Back</button>' +
        '<button id="depl-button-next" class="next btn btn-default" onclick="displayNetworkParam()" >Next</button>';
}

/* this function is called when the user change the value of a dropdown list
 @params:
 dropdown: id (without "dropdown-" of the dropdown
 value: value selected by the user
 */
function dropdownChange(dropdown, value) {
    // assign the new value to the commonParam
    commonParam[dropdown].value = value;
    switch (dropdown) {
        case 'country':
            $("#dropdown-" + dropdown).html(countryList[value]);
            break;
        case "region":
            $("#dropdown-" + dropdown).html(value);
            if (value.toLowerCase() == "fcc") {
                // if FCC, disable the country selector and add the 'disable' class to the country selector
                if ($("#country").hasClass("fa-check-square-o")) deplEnableParam('country', true);
                $("#country").addClass('disabled');
            } else {
                // if not FCC, remove the "disable" class to the country selector and enable the country selector
                $("#country").removeClass('disabled');
                if ($("#country").hasClass("fa-square-o")) deplEnableParam("country", true);
            }
            break;
    }
    return false;
}

/* function called when the value of an input changes
  @params:
  param: the type of input
 */
function inputChange(param) {
    var isValid = true;
    var elem = null;
    switch (param) {
        case "dns":
            // if "dns", check the validity of the value
            // if the value is valide, assign it to the commonParam
            elem = $('#dns-host');
            isValid = validateIP(elem.val());
            if (isValid) commonParam.dns.value = elem.val();
            break;
        case "ntp":
            // if "ntp", check the validity of the value
            // if the value is valide, assign it to the commonParam
            elem = $("#ntp-host");
            isValid = validateFQDN(elem.val());
            if (isValid) commonParam.ntp.value = elem.val();
            break;
        case "capwap-server":
            // if "capwap-server", check the validity of the value
            // if the value is valide, assign it to the commonParam
            elem = $("#capwap-server");
            isValid = validateFQDN(elem.val());
            if (isValid) commonParam.capwap.server = elem.val();
            break;
        case "capwap-port":
            // if "capwap-port", check the validity of the value
            // if the value is valide, assign it to the commonParam
            elem = $("#capwap-port");
            if (0 < elem.val() && elem.val() <= 65535) {
                isValid = true;
                commonParam.capwap.port = elem.val();
            } else isValid = false;
            break;
        case "proxy-host":
            // if "proxy-host", check the validity of the value
            // if the value is valide, assign it to the commonParam
            elem = $("#proxy-host");
            isValid = validateFQDN(elem.val());
            if (isValid) commonParam.capwap.http.proxy.host = elem.val();
            break;
        case "proxy-port":
            // if "port-port", check the validity of the value
            // if the value is valide, assign it to the commonParam
            elem = $("#proxy-port");
            if (0 < elem.val() && elem.val() <= 65535) {
                isValid = true;
                commonParam.capwap.http.proxy.port = elem.val();
            } else isValid = false;
            break;
        case "proxy-user":
            // if "proxy-user", assign the value to the commonParam
            elem = $("#proxy-user");
            commonParam.capwap.http.proxy.auth.user = elem.val();
            break;
        case "proxy-password":
            // if "proxy-password", assign the value to the commonParam
            elem = $("#proxy-password");
            commonParam.capwap.http.proxy.auth.password = elem.val();
            break;
    }
    // if the value is valid
    if (isValid) {
        // change the class of the input to "isValid"
        elem.removeClass("isNotValid").addClass("isValid");
        var allValid = true;
        // check if all the other inputs are valid
        $('input').each(function () {
            if ($(this).prop("disabled") == false) {
                if ($(this).hasClass('isNotValid')) allValid = false;
            }
        });
        // if this input and all the others are valid, enable the "next" button
        if (allValid) $("#depl-button-next").prop('disabled', false);
    } else {
        // if this input is not valid, disable the "next" button
        elem.addClass("isNotValid").removeClass("isValid");
        $("#depl-button-next").prop('disabled', true);
    }
}

/* this function is called when a "ON/OFF" switch is changed
 @params:
 formGroup: the id of the switch (without "switch-")
  */
function deplSwictchChange(formGroup) {
    var switchValue = $("#switch-" + formGroup).prop('checked');
    // assign the new value to the commonParam
    switch (formGroup) {
        case "capwap":
            commonParam.capwap.configured = switchValue;
            break;
        case "http":
            commonParam.capwap.http.configured = switchValue;
            if (switchValue) $("#capwap-port").val("80");
            else $("#capwap-port").val("12222");
            break;
        case "proxy":
            commonParam.capwap.http.proxy.configured = switchValue;
            break;
        case "proxy-auth":
            commonParam.capwap.http.proxy.auth.configured = switchValue;
            break;
    }
    // if the switch is moved to "On", enable the corresponding elements
    if (switchValue) {
        $(".switch-" + formGroup).prop('disabled', false);
    }
    // else, disable the corresponding elements
    else {
        $(".switch-" + formGroup).prop('disabled', true);
        // if the switch is moved to "Off", disable the next parameters
        switch (formGroup) {
            case 'capwap':
                if ($("#http").hasClass("fa-check-square-o")) deplEnableParam("http");
                break;
            case "http":
                if ($("#proxy").hasClass("fa-check-square-o")) deplEnableParam('proxy');
                break;
            case "proxy":
                if ($("#proxy-auth").hasClass("fa-check-square-o")) deplEnableParam('proxy-auth');
                break;
        }
    }
}

/* this function is called when a checkbox si changed, or to change the value (for example, when a "On/Off" switch is move)
@params:
formGroup: the id of element to change
force = true to force the change
 */
function deplEnableParam(formGroup, force) {
    var regionElem = $("#region");
    var countryElem = $("#country");
    var capwapElem = $("#capwap");
    var httpElem = $("#http");
    var proxyElem = $("#proxy");
    var proxyAuthElem = $("#proxy-auth");

    switch (formGroup) {
        // for the below elements, change the state (enable/disable) and the display
        // then, assign the enable/disable state to commonParam
        case "dns":
        case "ntp":
        case "save":
        case "reboot":
            formGroupState2(formGroup);
            commonParam[formGroup].enable = $("#" + formGroup).hasClass("fa-check-square-o");
            break;
        case "region":
            // if "region" is not locked (if "country" is enabled, force the region to "World")
            if (!regionElem.hasClass("disabled")) {
                formGroupState2("region");

                if (regionElem.hasClass("fa-check-square-o")) {
                    // if "region" is checked
                    // disable "country" (will be enabled/disabled depending on the region mode)
                    countryElem.addClass("disabled");
                    // if configured to "FCC", uncheck "country"  (can't be configured when FCC is selected)
                    if ($("#dropdown-region").html().toLowerCase() == "fcc") {
                        if (countryElem.hasClass("fa-check-square-o")) deplEnableParam("country", true);
                    } else {
                        // if "region" is checked and configured to something else than "FCC"
                        // enable "country" and check is
                        if (countryElem.hasClass("fa-square-o")) deplEnableParam("country", true);
                    }
                // when forced, enable the region
                } else if (force)formGroupState2("region");
                // else disable "region"
                else countryElem.removeClass("disabled");
            }
            // set the new value to commonParam
            commonParam.region.enable = regionElem.hasClass("fa-check-square-o");
            break;
        case "country":
            // if "country" is not locked (if "region" is enabled)
            if (!countryElem.hasClass("disabled")) {
                formGroupState2("country");
                // if "country" is enabled, and is now checked
                // check "region", lock it, and configure it as "World"
                if (countryElem.hasClass("fa-check-square-o")) {
                    regionElem.addClass("fa-check-square-o").removeClass("fa-square-o");
                    regionElem.addClass("disabled");
                    $("#dropdown-region").html("World");
                // else (if "country" is not checked)
                // unlock "region"
                } else {
                    regionElem.removeClass("fa-check-square-o").addClass("fa-square-o");
                    regionElem.removeClass("disabled");
                }
            // if forced, change the state of "country"
            } else if (force) formGroupState2("country");
            // set the new value to commonParam
            commonParam.country.enable = countryElem.hasClass("fa-check-square-o");
            break;
        case "capwap":
            if (force) {
                // if forced, enable "capwap" and turn the switch "On"
                $("#switch-capwap").prop("checked", true);
                if (capwapElem.hasClass("fa-square-o")) formGroupState2('capwap');
            // else change the "capwap" state
            } else {
                formGroupState2('capwap');
                // if capwap is disabled, disable also http (if enabled)
                if (capwapElem.hasClass("fa-square-o")) {
                    if (httpElem.hasClass("fa-check-square-o")) deplEnableParam("http");
                }
            }
            deplSwictchChange('capwap');
            // set the new value to commonParam
            commonParam.capwap.enable = capwapElem.hasClass("fa-check-square-o");
            if (capwapElem.hasClass('fa-square-o')) $(".switch-capwap").prop('disabled', true);
            break;
        case 'http':
            if (force) {
                // if forced, enable "capwap" and turn the switch "On"
                $("#switch-http").prop("checked", true);
                if (httpElem.hasClass("fa-square-o")) formGroupState2('http');
            } else {
                // else change the "http" state
                formGroupState2('http');
                // if http is disabled, disable the fields, use the default capwap port, and disable proxy (if enabled)
                if (httpElem.hasClass("fa-square-o")){
                    $(".switch-http").prop('disabled', true);
                    $("#capwap-port").val("12222");
                    if (proxyElem.hasClass("fa-check-square-o")) deplEnableParam('proxy');
                }
            }
            deplSwictchChange('http');
            commonParam.capwap.http.enable = httpElem.hasClass("fa-check-square-o");
            if (httpElem.hasClass("fa-check-square-o")) deplEnableParam('capwap', true);
            break;
        case 'proxy':
            // if forced, enable "proxy" and turn the switch "On"
            if (force) {
                $("#switch-proxy").prop("checked", true);
                if (proxyElem.hasClass("fa-square-o")) formGroupState2('proxy');
            } else {
                // else change the "proxy" state
                formGroupState2('proxy');
                //if disabled, disable the fields, and disable the proxy Auth if enabled
                if (proxyElem.hasClass("fa-square-o")){
                    $(".switch-proxy").prop('disabled', true);
                    if (proxyAuthElem.hasClass("fa-check-square-o")) deplEnableParam('proxy-auth');
                }
            }
            deplSwictchChange('proxy');
            commonParam.capwap.http.proxy.enable = proxyElem.hasClass("fa-check-square-o");
            if (proxyElem.hasClass("fa-check-square-o")) deplEnableParam('http', true);
            break;
        case 'proxy-auth':
            // change the "proxy-auth" state
            formGroupState2('proxy-auth');
            deplSwictchChange('proxy-auth');
            commonParam.capwap.http.proxy.auth.enable = proxyAuthElem.hasClass("fa-check-square-o");
            if (proxyAuthElem.hasClass("fa-square-o")) $(".switch-proxy-auth").prop('disabled', true);
            else deplEnableParam('proxy', true);
            break;
    }
}

function resumeParam() {
    resumeFormGroupState('region', commonParam.region);
    resumeFormGroupState('country', commonParam.country);
    resumeFormGroupState('dns', commonParam.dns);
    resumeFormGroupState('ntp', commonParam.ntp);
    resumeFormGroupState('capwap', commonParam.capwap);
    resumeFormGroupState('http', commonParam.capwap.http);
    resumeFormGroupState('proxy', commonParam.capwap.http.proxy);
    resumeFormGroupState('proxy-auth', commonParam.capwap.http.proxy.auth);
    resumeFormGroupState('save', commonParam.save);
    resumeFormGroupState('reboot', commonParam.reboot);
}


/* =================================================
 ======================= 3/4 =======================
 =================================================== */

function displayNetworkParam() {
    var disabledByDhcp = "";
    var disabledButtonByDhcp = "";
    var columnDhcp = "";
    var device;
    // change the breadcrumb status
    $(".depl-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#depl-network").removeClass("fa-circle-o").addClass("fa-circle");
    htmlString =
        "<button id='find-import' onclick='' class='btn btn-default' disabled='disabled'>Import</button>" +
        "<button id='find-export' onclick='' class='btn btn-default' disabled='disabled'>Export</button>" +
        "<button id='find-dhcp' onclick='dispalyDhcp(\"depl\")' class='btn btn-default'>Configure DHCP Server</button>" +
        '<table class="table asat-table">' +
        '<thead>' +
        '<tr>' +
        '<th>Serial Number</th>' +
        '<th>MAC Address</th>' +
        '<th>Current IP Address</th>' +
        '<th>DHCP Client</th>' +
        '<th>New IP Address</th>' +
        '<th>Gateway</th>' +
        '<th>Native VLAN</th>' +
        '<th>Mgmt VLAN</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';
    for (device in deviceList) {
        if (deviceList[device].selected) {
            if (dhcpParam.enable && dhcpParam.deviceId == device && dhcpParam.mgt0){
                if ((deviceList[device].configuration.ipAddress) || (deviceList[device].configuration.netmask)){
                    disabledByDhcp = "disabled = 'disabled";
                    disabledButtonByDhcp = "disabled";
                }
            }

            else columnDhcp =
            htmlString +=
                '<tr>' +
                '<td>' + deviceList[device].serialNumber + '</td>' +
                '<td>' + deviceList[device].macAddress + '</td>' +
                '<td>' + deviceList[device].ipAddress + '</td>' +
                '<td><i class="fa fa-square-o fa-lg" id="depl-dhcp-' + device + '" onclick="deplChangeDhcp(\'' + device + '\')"></td>' +
                '<td><input class="asat-table-input" '+disabledByDhcp+' id="newNet-' + device + '" type="text" placeholder=""' +
                'onkeypress="return networkKeyPress(event)" onchange="deplNewNet(\'' + device + '\')" size="18" ' +
                'value="' + deviceList[device].configuration.ipAddress + '"></td>' +
                '<td><input class="asat-table-input" '+disabledByDhcp+'  id="newGw-' + device + '" type="text" placeholder=""' +
                'onkeypress="return ipKeyPress(event)" onchange="deplNewGw(\'' + device + '\')" type="text" size="15" ' +
                'value="' + deviceList[device].configuration.gateway + '"></td>' +
                '<td><input class="asat-table-input" id="newNatVlan-' + device + '" ' +
                'onkeypress="return vlanKeyPress(event)" onchange="deplNewVlan(\'newNatVlan-\', \'' + device + '\')" type="text" size="5" ' +
                'value="' + deviceList[device].configuration.nativeVlan + '"></td>' +
                '<td><input class="asat-table-input" id="newMgmtVlan-' + device + '" ' +
                'onkeypress="return vlanKeyPress(event)" onchange="deplNewVlan(\'newMgmtVlan-\', \'' + device + '\')" type="text" size="5" ' +
                'value="' + deviceList[device].configuration.mgmtVlan + '"></td>' +
                '</tr>';
        }

    }
    htmlString +=
        '</tbody>' +
        '</table>';
    document.getElementById("depl-window").innerHTML = htmlString;
    document.getElementById("depl-action").innerHTML =
        '<button id="button-back" class="back btn btn-default" onclick="displayCommonParam()">Back</button>' +
        '<button id="depl-button-next" class="next btn btn-default '+disabledButtonByDhcp+'" onclick="displaySendConfiguration()" >Next</button>';

    for (device in deviceList) {
        if (deviceList[device].selected) {
            if (dhcpParam.enable && dhcpParam.deviceId == device && dhcpParam.mgt0) qtipDeplInfo($('#newNet-' + device), 'newNet-' + device, "IP Address configured from DHCP");
            else qtipDeplInfo($('#newNet-' + device), 'newNet-' + device, "IP Address/Mask. <br>Let blank for DHCP Client");
            if (deviceList[device].current.dhcp != deviceList[device].configuration.dhcp) {
                if (deviceList[device].configuration.dhcp) deplChangeDhcp(device);
            } else if (deviceList[device].current.dhcp) deplChangeDhcp(device);
        }
    }
}

function deplChangeDhcp(devId){
    var elem = $("#depl-dhcp-"+devId);
    if (elem.hasClass("enabled")) {
        elem.removeClass("fa-check-square-o").removeClass("enabled").addClass("fa-square-o");
        $('#newNet-' + devId).prop("disabled", false).removeClass("disabled");
        $('#newGw-' + devId).prop("disabled", false).removeClass("disabled");
    }
    else {
        elem.removeClass("fa-square-o").addClass("fa-check-square-o").addClass("enabled");
        $('#newNet-' + devId).prop("disabled", true).addClass("disabled");
        $('#newGw-' + devId).prop("disabled", true).addClass("disabled");
    }
    deviceList[devId].configuration.dhcp = elem.hasClass("enabled");
    console.log(deviceList[devId]);
}

function deplNewVlan(vlanType, devId) {
    var elem = $('#' + vlanType + devId);
    if (elem.val() > 0 && elem.val() < 4095) {
        switch (vlanType) {
            case "newNatVlan-":
                deviceList[devId].configuration.nativeVlan = elem.val();
                break;
            case "newMgmtVlan-":
                deviceList[devId].configuration.mgmtVlan = elem.val();
                break;
        }
        elem.removeClass("isNotValid").addClass("isValid");
        var api = $('#qtip-' + vlanType + devId).qtip('api');
        if (api) api.destroy(true);
        if ($(".isNotValid").length > 0) {
            $("#depl-button-next").prop('disabled', true);
        } else $("#depl-button-next").prop('disabled', false);
    } else {
        elem.addClass("isNotValid").removeClass("isValid");
        $("#depl-button-next").prop('disabled', true);
        qtipDeplError(elem, vlanType + devId, "VLAN value should be between 1 and 4094.");
    }
}

function deplNewNet(devId) {
    var elem = $("#newNet-" + devId);
    var api = $('#qtip-newNet-' + devId).qtip('api');
    if (api) api.destroy(true);
    var isValid = false;
    var network = elem.val().split("/");
    if (network.length == 2) {
        var ip = network[0];
        var mask = network[1];
        if (validateIP(ip)) {
            if (mask != "" && mask >= 0 && mask <= 32) {
                isValid = true;
            }
        }
    }
    if (network == "") {
        elem.removeClass("isNotValid").addClass("isValid");
        deviceList[devId].configuration.ipAddress = "";
        deviceList[devId].configuration.netmask = "";
        qtipDeplInfo(elem, 'newNet-' + devId, "IP Address/Mask. \r\nLet blank for DHCP Client");
        deplGwInNet(devId);
    } else if (isValid) {
        var block = new Netmask(elem.val());
        deviceList[devId].configuration.ipAddress = ip;
        deviceList[devId].configuration.netmask = block.mask;
        elem.removeClass("isNotValid").addClass("isValid");
        qtipDeplInfo(elem, 'newNet-' + devId, "IP Address/Mask. \r\nLet blank for DHCP Client");
        deplGwInNet(devId);
    } else {
        elem.addClass("isNotValid").removeClass("isValid");
        qtipDeplError(elem, 'newNet-' + devId, "IP configuration is not valid. Should be \"IP Address/mask\".");
        $("#depl-button-next").prop('disabled', true);
    }
}

function deplNewGw(devId) {
    var elem = $("#newGw-" + devId);
    var api = $('#qtip-newGw-' + devId).qtip('api');
    if (api) api.destroy(true);
    if (validateIP(elem.val())) {
        deviceList[devId].configuration.gateway = elem.val();
        elem.removeClass("isNotValid").addClass("isValid");
        deplGwInNet(devId);
    } else if (elem.val() == "") {
        deviceList[devId].configuration.gateway = "";
        elem.removeClass("isNotValid").addClass("isValid");
        deplGwInNet(devId);
    } else {
        elem.addClass("isNotValid").removeClass("isValid");
        qtipDeplError(elem, 'newGw-' + devId, "Invalid Gateway IP Address.");
        $("#depl-button-next").prop('disabled', true);
    }
}

function deplGwInNet(devId) {
    var network = $("#newNet-" + devId);
    var gateway = $("#newGw-" + devId);
    var isValid = false;
    if (network.hasClass("isValid") && gateway.hasClass('isValid')) {
        if (network.val() == "" && gateway.val() == "") isValid = true;
        else {
            if (network.val() == "" && gateway.hasClass('isValid')) {
                qtipDeplError(gateway, "newGw-" + devId, "Gateway can't be configured without IP configuration.");
                network.addClass("isNotValid").removeClass("isValid");
            } else if (gateway.val() == "" && network.hasClass("isValid")) {
                qtipDeplError(gateway, "newGw-" + devId, "Please set the gateway value.");
                gateway.addClass("isNotValid").removeClass("isValid");
            } else {
                var block = new Netmask(network.val());
                if (block.contains(gateway.val())) {
                    var devIp = network.val().split("/")[0];
                    if (devIp == gateway.val()) {
                        gateway.addClass("isNotValid").removeClass("isValid");
                        qtipDeplError(gateway, "newGw-" + devId, "Gateway and device IP addresses can't be the same.");
                    } else {
                        isValid = true;
                    }
                }
                else {
                    qtipDeplError(gateway, "newGw-" + devId, "Gateway value is not belonging to network.");
                    gateway.addClass("isNotValid").removeClass("isValid");
                }

            }
        }
    }
    if (isValid) {
        var api = $('#qtip-newGw-' + devId).qtip('api');
        if (api) api.destroy(true);
    }
    if ($(".isNotValid").length > 0) {
        $("#depl-button-next").prop('disabled', true);
    } else $("#depl-button-next").prop('disabled', false);

}

function qtipDeplError(elem, qtipId, message) {
    var qtipTitle = "Error";
    var qtipText = message;
    var qtipClass = "error";
    var api = $('#' + qtipId).qtip('api');
    if (api) api.destroy(true);
    elem.qtip({
        id: qtipId,
        content: {
            text: qtipText,
            title: qtipTitle
        },
        position: {
            my: "top center",
            at: "bottom center"
        },
        style: {
            classes: "qtip-shadow qtip-" + qtipClass
        }
    })
}

function qtipDeplInfo(elem, qtipId, message) {
    var qtipText = message;
    var qtipClass = "error";
    var api = $('#' + qtipId).qtip('api');
    if (api) api.destroy(true);
    elem.qtip({
        id: qtipId,
        content: {
            text: qtipText
        },
        position: {
            my: "top center",
            at: "bottom center"
        },
        style: {
            classes: "qtip-shadow qtip-info"
        }
    })
}


/* =================================================
 ======================= 4/4 =======================
 =================================================== */

function displaySendConfiguration() {
    // change the breadcrumb status
    $(".depl-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#depl-deploy").removeClass("fa-circle-o").addClass("fa-circle");
    htmlString =
        "<hr>" +
        '<div style="width:100%;">' +
        "<div id='progress-bar' class='progress depl'>" +
        "<div class='progress-bar' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100'>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<hr>" +
        '<table class="table asat-table">' +
        '<thead>' +
        '<tr>' +
        '<th>Initial IP Address</th>' +
        '<th>Serial Number</th>' +
        '<th>Region</th>' +
        '<th>Country Code</th>' +
        '<th>DNS</th>' +
        '<th>NTP</th>' +
        '<th>CAPWAP</th>' +
        '<th>CAPWAP Proxy</th>' +
        '<th>Network</th>' +
        '<th>Native VLAN</th>' +
        '<th>Mgmt VLAN</th>' +
        '<th>Save</th>' +
        '<th>Reboot</th>' +
        '<th>Status</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';
    for (var device in deviceList) {
        if (deviceList[device].selected) {
            htmlString +=
                '<tr>' +
                '<td>' + deviceList[device].ipAddress + '</td>' +
                '<td>' + deviceList[device].serialNumber + '</td>';
            if (commonParam.region.enable) htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';
            if (commonParam.country.enable) htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';
            if (commonParam.dns.enable) htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';
            if (commonParam.ntp.enable) htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';
            if (commonParam.capwap.enable) htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';
            if (commonParam.capwap.http.proxy.enable) htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';

            if (deviceList[device].configuration.ipAddress != "") htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';
            if (deviceList[device].configuration.nativeVlan != "") htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';
            if (deviceList[device].configuration.mgmtVlan != "") htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';

            if (commonParam.save.enable) htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';
            if (commonParam.reboot.enable) htmlString += '<td class="icon"><i class="fa fa-check-circle" style="color: green"></i></td>';
            else htmlString += '<td class="icon"><i class="fa fa-times-circle" style="color: red"></i></td>';
            htmlString +=
                '<td id="deploy-' + device + '" class="icon deploy-result"></td>' +
                '</tr>';
        }
    }

    htmlString +=
        '</tbody>' +
        '</table>';
    document.getElementById("depl-window").innerHTML = htmlString;
    document.getElementById("depl-action").innerHTML =
        '<button id="button-back" class="back btn btn-default" onclick="displayNetworkParam()">Back</button>' +
        '<button id="depl-button-next" class="next btn btn-default" onclick="startConfiguration()" >Deploy</button>';

}

/* =================================================
 ======================= FINAL =====================
 =================================================== */

messenger.on("depl deploy start", function (process, devCount) {
    if (process == discoverProcess) {
        deviceCount = devCount;
        deviceNumber = 0;
        $('.deploy-result').each(function () {
            $(this).html('<i class="fa fa-circle-o-notch fa-spin"></i>');
        })
    }
}).on("depl deploy update", function (process, devNum, error, warning, success) {
    if (process == discoverProcess) displayResultIcon("depl", devNum, error, warning, success, null, true);
}).on('depl deploy stop', function () {
    $('.progress-bar').css('width', '100%').text("Stopping test...").addClass("progress-bar-danger");
    $("#find-stop").prop("disabled", true);
}).on('depl deploy end', function (process) {
    if (discoverProcess == process) {
        $('.progress-bar').css('width', '100%').attr('aria-valuenow', deviceCount + "/" + deviceCount);
        $("#find-start").prop("disabled", false);
        $("#find-stop").prop("disabled", true);
        $("#find-clear").prop("disabled", false);
    }
});

function startConfiguration() {
    discoverProcess++;
    Deploy.start(discoverProcess, deviceList, commonParam, dhcpParam, credentials, 5, asatConsole, messenger);
}
