var db = require("./libs/sqlite.main");

var Discover = require("./libs/deployment.discover");
var Device = require('./libs/aerohive.device');


var credentials = {
    login: "admin",
    password: "aerohive"
};
var network = "192.168.1.0/24";

var deviceList = [];
var countryList = {};
const EventEmitter = require('events').EventEmitter;
var discoverMessenger = new EventEmitter();

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
        server: "redirector.aerohive.com",
        port: 12222,
        http: {
            enable: false,
            proxy: {
                enable: false,
                host: "",
                port: 8080,
                auth: false,
                user: "",
                password: ""
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


discoverMessenger.on("update", function (deviceNumber, deviceCount, device) {
    var percent = (deviceNumber / deviceCount) * 100;
    newDevice(device);
    $('.progress-bar').css('width', percent.toFixed(1) + '%').attr('aria-valuenow', percent.toFixed(1)).text(deviceNumber + "/" + deviceCount);
}).on('stop', function () {
    $('.progress-bar').addClass("progress-bar-danger");
    discoverMessenger.emit("end");
}).on('end', function () {
    $("#find-start").prop("disabled", false);
    $("#find-stop").prop("disabled", true);
    $("#find-clear").prop("disabled", false);
});
/* =================================================
 ============ Deployment locate Devices ============
 =================================================== */

function initDeployment() {
    db.CountryCode.getArray(function (res) {
        countryList = res;
        displayDeployment();
    })
}


/* =================================================
 ======================= 1/4 =======================
 =================================================== */
function displayDeployment() {
    // change the breadcrumb status
    $(".deployment-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#deployment-find").removeClass("fa-circle-o").addClass("fa-circle");
    // create HTML
    document.getElementById("deployment-window").innerHTML =
        '<div style="width: 100%; overflow: hidden;">' +
        '<div class="input-group" style="width: 40%; float: left">' +
        '<span class="input-group-addon"">Network:</span>' +
        '<input type="text" class="form-control" value="' + network + '" id="network"/>' +
        '</div>' +
        '<div class="input-group" style="width: 40%; margin: auto">' +
        '<span class="input-group-addon" >Password:</span>' +
        '<input type="password" class="form-control" value="' + credentials.password + '" id="password"/>' +
        '</div>' +
        '</div>' +
        "<hr>" +
        '<div style="width:100%;">' +
        "<div id='progress-bar' class='progress deployment'>" +
        "<div class='progress-bar' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100'>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<hr>" +
        "<button id='find-start' onclick='startDiscovery()' class='btn btn-default update'>Start</button>" +
        "<button id='find-stop' onclick='stopDiscovery()' class='btn btn-default update' disabled='disabled'>Stop</button>" +
        "<button id='find-clear' onclick='clearDiscovery()' class='btn btn-default update'>Clear</button>" +
        "<table class='table table-condensed'>" +
        "<thead>" +
        "<tr>" +
        "<th></th>" +
        "<th>Type</th>" +
        "<th>IP Address</th>" +
        "<th>Serial Number</th>" +
        "<th>MAC Address</th>" +
        "<th>Comment</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody id='table-deployment'>" +
        "" +
        "</tbody>" +
        "</table>";
    document.getElementById("deployment-action").innerHTML =
        '<button id="button-next" class="next btn btn-default" onclick="displayCommonParam()" >Next</button>';
    displayDevices();
}

function displayDevices() {
    var htmlString = "";
    for (var i in deviceList) {
        htmlString +=
            '<tr>';
        if (deviceList[i].selected == true) htmlString += '<td><input type="checkbox" onchange="findChange(\'' + i + '\')" id="device-"' + deviceList[i].serialNumber + '" checked="checked"/><td>';
        else htmlString += '<td><input type="checkbox" onchange="findChange(\'' + i + '\')" data-number="' + i + '" id="device-"' + deviceList[i].serialNumber + '"/><td>';
        htmlString +=
            '<td><input type="checkbox" onchange="findChange()" id="device-"' + deviceList[i].serialNumber + '/><td>' +
            '<td>' + deviceList[i].deviceType + '</td>' +
            '<td>' + deviceList[i].ipAddress + '</td>' +
            '<td>' + deviceList[i].serialNumber + '</td>' +
            '<td>' + deviceList[i].macAddress + '</td>' +
            '<td>' + deviceList[i].serialNumber + '</td>' +
            '</tr>';
    }
    $('#table-deployment').html(htmlString);
}
function startDiscovery() {
    $("#find-start").prop("disabled", true);
    $("#find-stop").prop("disabled", false);
    $("#find-clear").prop("disabled", true);
    var cidr = $('#network').val();
    console.log(cidr);
    Discover.discover(cidr, credentials, 5, asatConsole, discoverMessenger);
}
function stopDiscovery() {
    discoverMessenger.emit("stop");
}
function clearDiscovery() {
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
    deviceList.push(device);
    deviceList.sort(sortIp);
    displayDevices();
}

function findChange(i) {
    if (deviceList.hasOwnProperty(i)) {
        deviceList[i].selected = $(this).checked;
    }
}


/* =================================================
 ======================= 2/4 =======================
 =================================================== */
function displayCommonParam() {
    // change the breadcrumb status
    $(".deployment-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#deployment-common").removeClass("fa-circle-o").addClass("fa-circle");

    var htmlString =

        '<div style="width: 70%; margin: auto">' +
        '<div class="asat-group disabled region" onclick="enableParam(\'region\', event)">' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-globe fa-stack-1x"></i>' +
        '</span>' +
        '<span class="region disabled asat-group-addon">Region</span>' +
        '<span  class="dropdown">' +
        '<button id="region" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="disabled region">' +
        '<span class="list"  id="dropdown-region">' + commonParam.region.value + '</span>' +
        '<span class="caret"></span>' +
        '</button>' +
        '<ul class="dropdown-menu" aria-labelledby="dLabel">' +
        '<li onclick="dropdownChange(\'region\', \'FCC\')"><a href="#">FCC</a></li>' +
        '<li onclick="dropdownChange(\'region\', \'World\')"><a href="#">World</a></li>' +
        '</ul>' +
        '</span>' +
        '</div>' +

        '<div class="asat-group disabled country" onclick="enableParam(\'country\', event)">' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-flag fa-stack-1x"></i>' +
        '</span>' +
        '<span class="country disabled asat-group-addon">Country Code</span>' +
        '<span  class="dropdown">' +
        '<button id="country" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class="disabled country">' +
        '<span class="list"  id="dropdown-country">' + countryList[commonParam.country.value] + '</span>' +
        '<span class="caret"></span>' +
        '</button>' +
        '<ul class="dropdown-menu scrollable-menu" aria-labelledby="dLabel">';
    for (var i in countryList) htmlString += '<li onclick="dropdownChange(\'country\', \''+i+'\')"><a href="#">'+countryList[i] + ' (' + i + ')</a></li>';

        htmlString +=
        '</ul>' +
        '</span>' +
        '</div>' +

        '<hr>' +
        '<div style="width: 100%; overflow: hidden;">' +

        '<div class="asat-group half left disabled dns" onclick="enableParam(\'dns\', event)">' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-sitemap fa-stack-1x"></i>' +
        '</span>' +
        '<span class="dns disabled asat-group-addon">DNS Server</span>' +
        '</i>' +
        '<input type="text" onchange="inputChange(\'dns\')" class="form-control dns" id="dns" disabled="disabled" value="' + commonParam.dns.value + '"/>' +
        '</div>' +

        '<div class="asat-group half right disabled ntp" onclick="enableParam(\'ntp\', event)">' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-clock-o fa-stack-1x"></i>' +
        '</span>' +
        '<span class="ntp disabled asat-group-addon">NTP Server</span>' +
        '</i>' +
        '<input type="text" onchange="inputChange(\'ntp\')" class="form-control ntp" id="ntp" disabled="disabled" value="' + commonParam.ntp.value + '"/>' +
        '</div>' +
        '</div>' +
        '<hr>' +

        '<div class="asat-group disabled capwap" onclick="enableParam(\'capwap\', event)">' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-link fa-stack-1x"></i>' +
        '</span>' +
        '<span class="capwap disabled asat-group-addon">CAPWAP </span>' +
        '<div class="input-group">' +
        '<span class="input-group-addon" >Host :</span>' +
        '<input type="text" onchange="inputChange(\'capwap-server\')" class="form-control capwap" id="capwap-server" disabled="disabled" value="' + commonParam.capwap.server + '"/>' +
        '</div>' +
        '<div class="input-group">' +
        '<span class="input-group-addon" >Port :</span>' +
        '<input type="text" class="capwap form-control"  onchange="inputChange(\'capwap-port\')" onkeypress="return portKeyPress(\'capwap-port\', event)" id="capwap-port" disabled="disabled" value="' + commonParam.capwap.port + '"/>' +
        '</div>' +
        '</div>' +


        '<div class="asat-group disabled http" onclick="enableParam(\'http\', event)">' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-link fa-stack-1x"></i>' +
        '</span>' +
        '<i class="fa fa-plus"></i>' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-cloud fa-1x"></i>' +
        '</span>' +
        '<span class="http asat-group-addon disabled">HTTP Encapsulation</span>' +
        '</div>' +




        '<div class="asat-group disabled proxy" onclick="enableParam(\'proxy\', event)">' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-link fa-stack-1x"></i>' +
        '</span>' +
        '<i class="fa fa-plus"></i>' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-cloud fa-1x"></i>' +
        '</span>' +
        '<i class="fa fa-plus"></i>' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-share-alt fa-stack-1x"></i>' +
        '</span>' +
        '<span class="proxy disabled asat-group-addon" >CAPWAP Proxy</span>' +
        '<div class="input-group">' +
        '<span class="input-group-addon">Host:</span>' +
        '<input type="text" onchange="inputChange(\'proxy-host\')" class="form-control proxy" id="proxy-host" disabled="disabled" value="' + commonParam.capwap.http.proxy.host + '"/>' +
        '</div>' +
        '<div class="input-group">' +
        '<span class="input-group-addon">Port:</span>' +
        '<input type="text" onchange="inputChange(\'proxy-port\')" size="5" class="form-control proxy" onkeypress="return portKeyPress(\'proxy-port\', event)" id="proxy-port" disabled="disabled" value="' + commonParam.capwap.http.proxy.port + '"/>' +
        '</div>' +
        '</div>' +

        '<div class="asat-group disabled proxy-auth" onclick="enableParam(\'proxy-auth\', event)">' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-link fa-stack-1x"></i>' +
        '</span>' +
        '<i class="fa fa-plus"></i>' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-cloud fa-1x"></i>' +
        '</span>' +
        '<i class="fa fa-plus"></i>' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-share-alt fa-stack-1x"></i>' +
        '</span>' +
        '<i class="fa fa-plus"></i>' +
        '<span class="fa-stack fa-lg">' +
            '<i class="fa fa-square-o fa-stack-2x"></i>' +
            '<i class="fa fa-lock fa-stack-1x"></i>' +
        '</span>' +
        '<span class="proxy-auth disabled asat-group-addon" >Proxy Authentication</span>' +
        '<div class="input-group">' +
        '<span class="input-group-addon">Username:</span>' +
        '<input type="text" onchange="inputChange(\'proxy-user\')" class="form-control proxy-auth" id="proxy-user" disabled="disabled" value="' + commonParam.capwap.http.proxy.user + '"/>' +
        '</div>' +
        '<div class="input-group">' +
        '<span class="input-group-addon">Password:</span>' +
        '<input type="password" onchange="inputChange(\'proxy-password\')" class="form-control proxy-auth" id="proxy-password" disabled="disabled" value="' + commonParam.capwap.http.proxy.password + '"/>' +
        '</div>' +

        '</div>' +
        '<hr> ' +
        '<div class="asat-group save disabled" onclick="enableParam(\'save\', event)">' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-save fa-stack-1x"></i>' +
        '</span>' +
        '<span class="save asat-group-addon disabled">Save Configuration (Persistent after reboot)</span>' +
        '</div>' +
        '<div class="asat-group  reboot disabled" onclick="enableParam(\'reboot\', event)">' +
        '<span class="fa-stack fa-lg">' +
        '<i class="fa fa-square-o fa-stack-2x"></i>' +
        '<i class="fa fa-refresh fa-stack-1x"></i>' +
        '</span>' +
        '<span class="reboot asat-group-addon disabled">Reboot Device</span>' +
        '</div>' +
        '<hr>' +
        '</div>' +
        '</div>';
    document.getElementById("deployment-window").innerHTML = htmlString;
    resumeParam();
    document.getElementById("deployment-action").innerHTML =
        '<button id="button-back" class="back btn btn-default" onclick="displayDeployment()">Back</button>' +
        '<button id="button-next" class="next btn btn-default" onclick="console.log(commonParam)" >Next</button>';
}

function dropdownChange(dropdown, value) {
    commonParam[dropdown].value = value;
    if (dropdown == "country") $("#dropdown-" + dropdown).html(countryList[value]);
    else $("#dropdown-" + dropdown).html(value);
}


function inputChange(param){
    var isValid = true;
    var elem = null;
    switch (param){
        case "dns":
            elem = $('#dns');
            isValid = valideateIP(elem.val());
            if (isValid) commonParam.dns.value = elem.val();
            break;
        case "ntp":
            elem = $("#ntp");
            isValid = validateFQDN(elem.val());
            if (isValid) commonParam.ntp.value = elem.val();
            break;
        case "capwap-server":
            elem = $("#capwap-server");
            isValid = validateFQDN(elem.val());
            if (isValid) commonParam.capwap.server= elem.val();
            break;
        case "capwap-port":
            elem = $("#capwap-port");
            if (0 < elem.val() && elem.val() <= 65535) {
                isValid = true;
                commonParam.capwap.port = elem.val();
            } else isValid = false;
            break;
        case "proxy-host":
            elem = $("#proxy-host");
            isValid = validateFQDN(elem.val());
            if (isValid) commonParam.capwap.http.proxy.host= elem.val();
            break;
        case "proxy-port":
            elem = $("#proxy-port");
            if (0 < elem.val() && elem.val() <= 65535) {
                isValid = true;
                commonParam.capwap.http.proxy.port = elem.val();
            } else isValid = false;
            break;
        case "proxy-user":
            elem = $("#proxy-user");
            commonParam.capwap.http.proxy.user = elem.val();
            break;
        case "proxy-password":
            elem = $("#proxy-password");
            commonParam.capwap.http.proxy.password = elem.val();
            break;
    }
    if (isValid) {
        elem.removeClass("isNotValid").addClass("isValid");
        var allValid = true;
        $('input').each(function(){
                if ($(this).prop("disabled") == false) {
                    if ($(this).hasClass('isNotValid')) allValid = false;
                }
            });
        if (allValid) $("#button-next").prop('disabled', false);
    } else {
        elem.addClass("isNotValid").removeClass("isValid");
        $("#button-next").prop('disabled', true);
    }
}



function enableParam(formGroup, event) {
    switch (formGroup) {
        case "region":
            formGroupState('region', event);
            commonParam.region.enable = $("div.region").hasClass("enabled");
            break;
        case "country":
            formGroupState('country', event);
            commonParam.country.enable = $("div.country").hasClass("enabled");
            break;
        case "dns":
            formGroupState('dns', event);
            commonParam.dns.enable = $("div.dns").hasClass("enabled");
            break;
        case "ntp":
            formGroupState('ntp', event);
            commonParam.ntp.enable = $("div.ntp").hasClass("enabled");
            break;
        case "capwap":
            formGroupState('capwap', event);
            commonParam.ntp.enable = $("div.capwap").hasClass("enabled");
            break;
        case 'http':
            if ($("div.http").hasClass("disabled")) {
                commonParam.capwap.http.enable = true;
                if ($("div.capwap").hasClass("disabled")) {
                    commonParam.capwap.enable = true;
                }
            } else commonParam.capwap.http.enable = false;
            formGroupState('http', event);
            break;
        case 'proxy':
            if ($("div.proxy").hasClass("disabled")) {
                commonParam.capwap.http.proxy.enable = true;
                if ($("div.capwap").hasClass("disabled")) {
                    commonParam.capwap.enable = true;
                    formGroupState('capwap', event);
                }
                if ($("div.http").hasClass("disabled")) {
                    commonParam.capwap.http.enable = true;
                    formGroupState('http', event);
                }
            } else commonParam.capwap.http.proxy.enable = false;
            formGroupState('proxy', event);
            break;
        case 'proxy-auth':
            if ($("div.proxy-auth").hasClass("disabled")) {
                commonParam.capwap.http.proxy.auth = true;
                if ($("div.capwap").hasClass("disabled")) {
                    commonParam.capwap.enable = true;
                    formGroupState('capwap', event);
                }
                if ($("div.http").hasClass("disabled")) {
                    commonParam.capwap.http.enable = true;
                    formGroupState('http', event);
                }
                if ($("div.proxy").hasClass("disabled")) {
                    commonParam.capwap.http.proxy.enable = true;
                    formGroupState('proxy', event);
                } else commonParam.capwap.http.proxy.auth = false;
            }
            formGroupState('proxy-auth', event);
            break;
        case "save":
            formGroupState('save', event);
            commonParam.save.enable = $("div.save").hasClass("enabled");
            break;
        case "reboot":
            formGroupState('reboot', event);
            commonParam.reboot.enable = $("div.reboot").hasClass("enabled");
            break;
    }
}

function resumeParam() {
    resumeFormGroupState('region', commonParam.region.enable);
    resumeFormGroupState('country', commonParam.country.enable);
    resumeFormGroupState('dns', commonParam.dns.enable);
    resumeFormGroupState('ntp', commonParam.ntp.enable);
    resumeFormGroupState('capwap', commonParam.capwap.enable);
    resumeFormGroupState('http', commonParam.capwap.http.enable);
    resumeFormGroupState('proxy', commonParam.capwap.http.proxy.enable);
    resumeFormGroupState('proxy-auth', commonParam.capwap.http.proxy.auth);
    resumeFormGroupState('save', commonParam.save.enable);
    resumeFormGroupState('reboot', commonParam.reboot.enable);
}


/* =================================================
 ======================= 3/4 =======================
 =================================================== */