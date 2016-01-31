var db = require("./libs/sqlite.main");
var testList = [];
var options = [];
var proxy = {
    configured: false,
    host: "",
    port: 8023,
    auth: false,
    user: "",
    password: ""
};
var hm6 = {
    dc_type: "hm",
    dc_area: "emea",
    cluster: "51"
};
var hmng = {
    dc_area: 'ie'
};

var hm6DcList = {};
var hm6DcTypeList = {};
var hmNgDcList = {};

function initFirewallTest() {
    db.Hm6DC.getArray(function (res) {
        hm6DcList = res;
        db.Hm6Type.getArray(function (res) {
            hm6DcTypeList = res;
            db.HmNgDC.getArray(function (res) {
                hmNgDcList = res;
                displayFirewallTest();
            })
        })
    })
}

//const EventEmitter = require('events').EventEmitter;
//var firewallMessenger = new EventEmitter();

/* ===================================================
 ============= FW tests (HM or DEVICES) ============
 =================================================== */

function displayFirewallTest() {
    // change the breadcrumb status
    $(".firewall-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#firewall-test-type").removeClass("fa-circle-o").addClass("fa-circle");
    // create HTML
    document.getElementById("firewall-test").innerHTML =
        '<div class="list-group">' +
        '<a href="#" class="list-group-item" id="firewall-from-devices" onclick="displayFirewallService(\'device\')">' +
        '<h4 class="list-group-item-heading">Test Aerohive Devices Connection<i id="firewall-from-devices-check" style="float:right"></i></h4>' +
        '<p class="list-group-item-text">Test ports used by Aerohive Devices to contact Aerohive Online Services</p>' +
        '</a>' +
        '<a href="#" class="list-group-item" id="firewall-from-hivemanager" onclick="displayFirewallService(\'hivemanager\')">' +
        '<h4 class="list-group-item-heading">Test HiveManager OnPremise Connection<i id="firewall-from-hivemanager-check" style="float:right"></i></h4>' +
        '<p class="list-group-item-text">Test ports used by Aerohive HiveManager to contact Aerohive Online Services</p>' +
        '</a>' +
        '</div>';
    document.getElementById("firewall-action").innerHTML = "";
}

/* ===================================================
 ======= FW services (HMupdates, IDM, ...) =========
 =================================================== */
function displayFirewallServiceHTML(res, type) {
    // create HTML
    var htmlString = '<div class="list-group">';
    var entry;
    for (var i in res) {
        entry = res[i];
        htmlString +=
            '<a href="#" class="list-group-item" ' +
            'id="firewall-entry-' + entry.getEntry().ENTRY_ID + '" ' +
            'data-entry-id="' + entry.getEntry().ENTRY_ID + '" ' +
            'onclick="buttonFirewall(\'firewall-entry-' + entry.getEntry().ENTRY_ID + '\', \'firewall-entry-\', false);  return false;">' +
            '<h4 class="list-group-item-heading">' +
            entry.getEntry().ENTRY_NAME +
            '<i id="firewall-entry-' + entry.getEntry().ENTRY_ID + '-check" style="float:right"></i>' +
            '</h4>' +
            '<p class="list-group-item-text">...</p>' +
            '</a>';
    }
    htmlString += '</div>';
    document.getElementById("firewall-test").innerHTML = htmlString;
    // change the buttons status
    document.getElementById("firewall-action").innerHTML =
        '<button id="button-back" class="back btn btn-default" onclick="displayFirewallTest()">Back</button>' +
        '<button id="button-next" class="next btn btn-default" onclick="displayFirewallDestinations(\'' + type + '\')" disabled="disabled">Next</button>';
}

function displayFirewallService(type) {
    // clear the test list. It will be populated just below
    testList = [];
    // change the breadcrumb status
    $(".firewall-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#firewall-service").removeClass("fa-circle-o").addClass("fa-circle");
    // if it's a "from device" test
    if (type == "device") {
        // select all the entries (HM6, HMNG, IDM, Redirector, ...) in the DB
        db.Service.getAll(function (err, res) {
            displayFirewallServiceHTML(res, type);
        });
        // if it's a "from HM Onpremise" test
    } else if (type == "hivemanager") {
        // select all the entries (HM6, HMNG, IDM, Redirector, ...) in the DB
        db.HmVersion.getAll(function (err, res) {
            displayFirewallServiceHTML(res, type);
        });
    } else displayFirewallTest();
}

/* ===================================================
 ================ FW DESTINATIONS ==================
 =================================================== */
function displayFirewallDestinationsHTML(type, optionString) {
    // change the breadcrumb status
    $(".firewall-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#firewall-test-run").removeClass("fa-circle-o").addClass("fa-circle");
    var htmlString =
        "<div class='ui-sec-tle'><h3>Parameters</h3></div>" +
        displayProxyButton(type) +
        optionString +
        "<div class='ui-sec-tle'><h3>Tests</h3></div>" +
        "<table class='table table-condensed' id='entry-list'>" +
        "<thead>" +
        "<tr>" +
        "<th> Service </th>" +
        "<th> Hostname </th>" +
        "<th> Port </th>" +
        "<th> Protocol </th>" +
        "<th> Test Result </th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>";
    for (var i in testList) {
        for (var j in testList[i]) {
            var hostnameHTML = "<td>" + testList[i][j].HOST + "</td>";
            // if the user selected HM6 tests; add a data proporty to be able to change the hostname value based on the configuration
            if (testList[i][j].SERVICE_ID == "1") hostnameHTML = "<td class='hm6' data-i='" + i + "'data-j='" + j + "'>" + testList[i][j].getHost(hm6, hmng) + "</td>";
            // if the user selected HMNG tests; add a data proporty to be able to change the hostname value based on the configuration
            else if (testList[i][j].SERVICE_ID == "2") hostnameHTML = "<td class='hmng' data-i='" + i + "'data-j='" + j + "'>" + testList[i][j].getHost(hm6, hmng) + "</td>";
            htmlString +=
                "<tr>" +
                "<td>" + testList[i][j].TEST_NAME + "</td>" +
                hostnameHTML +
                "<td>" + testList[i][j].PORT + "</td>" +
                "<td class='firewall-test-result'>" + testList[i][j].PROTO_NAME + '</td>' +
                "<td class='firewall-test-result' id='firewall-entry-" + testList[i][j].TEST_ID + "'> </td>" +
                "</tr>";
        }
    }

    htmlString += "</tbody></table> ";
    document.getElementById("firewall-test").innerHTML = htmlString;
    // change the buttons status
    document.getElementById("firewall-action").innerHTML =
        '<button id="button-back" class="back btn btn-default" onclick="displayFirewallService(\'' + type + '\')">Back</button>' +
        '<button id="button-next" class="next btn btn-default" onclick="startFirewallTest(\'' + type + '\')">Run Test</button>';
    hm6DcChange();
    hm6ClusterChange();
    hmNgDcChange();
}
function displayFirewallDestinationsOptions(type, options) {
    var htmlString = "";
    if (options.indexOf("hm6") >= 0 || options.indexOf("hmng") >= 0) {
        htmlString +=
            "<table class='table table-condensed'>" +
            "<thead>" +
            "<tr>" +
            "<th style='width: 19%'></th>" +
            "<th style='width: 27%'>Server Type</th>" +
            "<th style='width: 27%'>Datacenter</th>" +
            "<th style='width: 27%'>Cluster Number</th>" +
            "</tr>" +
            "</thead>" +
            "<tbody>";
        if (options.indexOf("hm6") >= 0) htmlString += displayHm6Option();
        if (options.indexOf("hmng") >= 0) htmlString += displayHmNgOption();
        htmlString +=
            "</tbody>" +
            "</table>";
    }
    displayFirewallDestinationsHTML(type, htmlString);
}

function displayFirewallDestinations(type) {
    if (testList.length == 0) {
        options = [];
        // select all the "selected" entries
        var selectedServices = $("a[id^='firewall-entry-'].active");
        var selectedServicesNumber = 0;
        //for each selected entry, get the destinations from the DB
        $(selectedServices).each(function () {
            var entryId = $(this).data("entry-id");
            if (type == "device") {
                // if the user selected HM6 tests; this will display HM6 options (DC and cluster)
                if (entryId == 1) options.push("hm6");
                // if the user selected HMNG tests; this will display HMNG options (area)
                else if (entryId == 2) options.push('hmng');
                db.Device.findByServiceId(entryId, function (err, res) {
                    testList.push(res);
                    selectedServicesNumber++;
                    if (selectedServicesNumber == selectedServices.length) displayFirewallDestinationsOptions(type, options);
                });
            } else if (type == "hivemanager") {
                db.HiveManager.findByHmVersionId(entryId, function (err, res) {
                    testList.push(res);
                    selectedServicesNumber++;
                    if (selectedServicesNumber == selectedServices.length) displayFirewallDestinationsOptions(type, options);
                });
            } else displayFirewallDestinationsOptions(type, options);
        });
    } else displayFirewallDestinationsOptions(type, options);
}

/* ===================================================
 ====================== FW RESULTS =================
 =================================================== */
function startFirewallTest(type) {
    // clear the "Test Result column"
    for (var i in testList) {
        for (var j in testList[i]) {
            document.getElementById("firewall-entry-" + testList[i][j].TEST_ID).innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i>';
        }
    }
    // change the buttons status
    document.getElementById("firewall-action").innerHTML =
        '<button id="button-back" class="back btn btn-default" onclick="displayFirewallService(\'' + type + '\')">Back</button>' +
        '<button id="button-next" class="next btn btn-default" onclick="startFirewallTest()">Restart Test</button>';
    for (var i in testList) {
        for (var j in testList[i]) {
            var test = testList[i][j];

            //UDP
            if (test.PROTO_ID == "2") {
                if (proxy.configured) {
                    displayResult(test.TEST_ID, null, null, null, true);
                } else {
                    new UDPTest(test.getHost(hm6, hmng), test.PORT, test.TEST_ID, asatConsole, function (error, warning, success) {
                        displayResult(this.test.TEST_ID, error, warning, success)
                    }.bind({test: test}));
                }

                // TCP
            } else if (test.PROTO_ID == "1") {
                if (test.PORT == 80) {
                    new HTTPTest(test.getHost(hm6, hmng), test.PORT, test.TEST_ID, asatConsole, proxy, function (error, warning, success) {
                        displayResult(this.test.TEST_ID, error, warning, success)
                    }.bind({test: test}));
                } else if (test.PORT == 443) {
                    new HTTPSTest(test.getHost(hm6, hmng), test.PORT, test.TEST_ID, asatConsole, proxy, function (error, warning, success) {
                        displayResult(this.test.TEST_ID, error, warning, success)
                    }.bind({test: test}));
                    //displayResult(test.TEST_ID, null, null, true);

                } else {
                    if (proxy.configured) {
                        displayResult(test.TEST_ID, null, null, null, true);
                    } else {
                        new TCPTest(test.getHost(hm6, hmng), test.PORT, test.TEST_ID, asatConsole, function (error, warning, success) {
                            displayResult(this.test.TEST_ID, error, warning, success)
                        }.bind({test: test}));
                    }
                }
            }
        }
    }
}

/* ===================================================
 ====================== QTIP =========================
 =================================================== */

function displayResult(testId, error, warning, success, notWithProxy) {
    var qtipText = "";
    var qtipTitle = "";
    var qtipClass = "";
    if (error) {
        qtipTitle = "Error";
        qtipText = error;
        qtipClass = "error";
        $("#firewall-entry-" + testId).html("<i id='result-" + testId + "' class='fa fa-times-circle' style='color: red'></i>");
    } else if (warning) {
        qtipTitle = "Warning";
        qtipText = warning;
        qtipClass = "warning";
        $("#firewall-entry-" + testId).html("<i id='result-" + testId + "' class='fa fa-warning' style='color: orange'></i>");
    } else if (notWithProxy) {
        qtipTitle = "Proxy enabled";
        qtipText = "Can't perform this test when the proxy is enabled";
        qtipClass = "proxy";
        $("#firewall-entry-" + testId).html("<i id='result-" + testId + "' class='fa fa-exclamation-circle' style='color: dodgerblue'></i>");
    } else {
        qtipTitle = "Success";
        qtipText = success;
        qtipClass = "success";
        $("#firewall-entry-" + testId).html("<i id='result-" + testId + "' class='fa fa-check-circle' style='color: green'></i>");
    }

    $("#result-" + testId).qtip({
        content: {
            text: qtipText,
            title: qtipTitle
        },
        position: {
            my: "right center",
            at: "left center"
        },
        style: {
            classes: "qtip-shadow qtip-" + qtipClass
        }
    })
}


/* ===================================================
 ======================== BUTTONS ====================
 =================================================== */

/* ===================================================
 ====================== FW BUTTONS ===================
 =================================================== */
function buttonFirewall(id, prefix, exclusif) {
    var currentButton = $("#" + id);
    if (currentButton.hasClass("active")) {
        currentButton.removeClass("active");
        $("#" + id + "-check").removeClass("fa fa-check");
        if ($("a[id^='" + prefix + "'].active").length == 0) {
            $("#button-next").prop("disabled", true);
        }
    }
    else {
        if (exclusif == true) {
            $("[id^=" + prefix + "]").removeClass("active").removeClass("fa fa-check");
        }
        currentButton.addClass("active");
        $("#" + id + "-check").addClass("fa fa-check");
        $("#button-next").prop("disabled", false);
    }
}

/* ===================================================
 ====================== PROXY BUTTONS =================
 =================================================== */
function displayProxyButton(type, options) {
    var htmlString = "<span>Proxy: </span>";
    if (proxy.configured) {
        htmlString +=
            '<span class="badge span-enabled"><a href="#" id="button-proxy" onclick="proxyConfiguration(\'' + type + '\', \'' + options + '\')">' +
            'Enabled ' +
            '<i class="fa fa-check-square-o"></i>' +
            '</a></span>';
    } else {
        htmlString +=
            '<span class="badge span-disabled"><a href="#" id="button-proxy" onclick="proxyConfiguration(\'' + type + '\', \'' + options + '\')">' +
            'Disabled ' +
            '<i class="fa fa-square-o"></i>' +
            '</a></span>';
    }
    return htmlString;
}

function proxyConfiguration(type) {
    document.getElementById("firewall-test").innerHTML =
        '<div style="width: 70%; margin: auto">' +
        "<div class='ui-sec-tle'><h3>Proxy Configuration</h3></div>" +

        '<div class="proxy">' +
        '<i class="fa fa-square-o fa-lg deployment" id="proxy" onclick="fwSwictchChange(\'proxy\')"> '+
        '<span class="capwap disabled asat-group-addon">CAPWAP Proxy</span>' +
        '</i>' +
        '<span class="controls">' +
        '<input name="ace-switch-proxy" class="ace-switch ace-switch-7" type="checkbox" disabled="disabled" checked="checked">' +
        '<span class="lbl switch-label"></span>' +
        '</span>' +
        '<div class="input-group deployment first">' +
        '<span class="input-group-addon">Host:</span>' +
        '<input type="text" onchange="firewallProxyInputChange(\'proxy-host\')" class="form-control proxy" id="proxy-host" disabled="disabled" value="' + proxy.host + '"/>' +
        '</div>' +
        '<div class="input-group deployment first">' +
        '<span class="input-group-addon">Port:</span>' +
        '<input type="text" onchange="firewallProxyInputChange(\'proxy-port\')" size="5" class="form-control proxy" onkeypress="return portKeyPress(\'proxy-port\', event)" id="proxy-port" disabled="disabled" value="' + proxy.port + '"/>' +
        '</div>' +
        '</div>' +

        '<div class="proxy-auth">' +
        '<i class="fa fa-square-o fa-lg deployment" id="proxy-auth" onclick="fwSwictchChange(\'proxy-auth\')"> '+
        '<span class="capwap disabled asat-group-addon">Proxy Authentication</span>' +
        '</i>' +
        '<span class="controls">' +
        '<input name="ace-switch-proxy-auth" class="ace-switch ace-switch-7" type="checkbox" disabled="disabled" checked="checked">' +
        '<span class="lbl switch-label"></span>' +
        '</span>' +
        '<div class="input-group deployment first">' +
        '<span class="input-group-addon">Username:</span>' +
        '<input type="text" class="form-control proxy-auth" id="proxy-user" disabled="disabled" value="' + proxy.user + '"/>' +
        '</div>' +
        '<div class="input-group deployment first">' +
        '<span class="input-group-addon">Password:</span>' +
        '<input type="password" class="form-control proxy-auth" id="proxy-password" disabled="disabled" value="' + proxy.password + '"/>' +
        '</div>' +
        '</div>' +

        '</div>';

    document.getElementById("firewall-action").innerHTML =
        '<button id="button-back" class="back btn btn-default" onclick="displayFirewallDestinations(\'' + type + '\')">Cancel</button>' +
        '<button id="button-next" class="next btn btn-default" onclick="saveProxy(\'' + type + '\')">Save</button>';

    resumeProxy(proxy.configured);
}



function saveProxy(type) {
    proxy.configured = $("#proxy").hasClass("fa-check-square-o");
    proxy.host = $("#proxy-host").val();
    proxy.port = $("#proxy-port").val();
    proxy.auth = $("#proxy-auth").hasClass("fa-check-square-o");
    proxy.user = $("#proxy-user").val();
    proxy.password= $("#proxy-password").val();
    console.log(proxy);
    displayFirewallDestinations(type);
}

function firewallProxyInputChange(param){
    var isValid = true;
    var elem = null;
    switch (param){
        case "proxy-host":
            elem = $("#proxy-host");
            isValid = validateFQDN(elem.val());
            break;
        case "proxy-port":
            elem = $("#proxy-port");
            if (0 < elem.val() && elem.val() <= 65535) isValid = true;
            else isValid = false;
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



function fwSwictchChange(formGroup) {
    switch (formGroup) {
        case 'proxy':
            formGroupState2('proxy');
            if ($("#proxy").hasClass("fa-square-o")) {
                if ($("#proxy-auth").hasClass("fa-check-square-o")) {
                    formGroupState2('proxy-auth');
                }
            }
            break;
        case 'proxy-auth':
            formGroupState2('proxy-auth');
            if ($("#proxy-auth").hasClass("fa-check-square-o")) {
                if ($("#proxy").hasClass("fa-square-o")) {
                    formGroupState2('proxy');
                }
            }
            break;
    }
}

function resumeProxy() {
    resumeFormGroupState('proxy', proxy.configured);
    resumeFormGroupState('proxy-auth', proxy.auth);
}
/* ===================================================
 ====================== HM6 PARAMs ===================
 =================================================== */
function displayHm6Option() {
    return "<tr>" +
        "<th>" +
        "HM 6" +
        "</th>" +
        "<td id='hm6DcType'>" +
        hm6TypeDisplay() +
        "</td>" +
        "<td id='hm6DcArea'>" +
        hm6DcDisplay() +
        "</td>" +
        "<td>" +
        '<div class="input-group">' +
        "<input type='number' class='form-control' style='padding: 0; height: 100%' size='4' id='hm6_cluster' onkeypress='return event.charCode >= 48 && event.charCode <= 57' oninput='hm6ClusterChange()' value='" + hm6.cluster + "'/>" +
        "</dov>" +
        "</td>" +
        "</tr>";
}

function hm6TypeDisplay() {
    var htmlString =
        '<div  class="dropdown">' +
        '<button id="hm6DcTypeDropDown" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
        '<span class="list">' + hm6DcTypeList[hm6.dc_type] + '</span>' +
        '<div><span class="caret"></span></div>' +
        '</button>' +
        '<ul class="dropdown-menu" aria-labelledby="dLabel">';
    for (var hm6DcType in hm6DcTypeList) {
        if (hm6DcType != hm6.dc_type) {
            htmlString += '<li onclick="hm6TypeChange(\'' + hm6DcType + '\')" data-type="' + hm6DcType + '"><a href="#">' + hm6DcTypeList[hm6DcType] + '</a></li>';
        }
    }
    htmlString +=
        '</ul>' +
        '</div>';
    return htmlString;
}

function hm6TypeChange(type) {
    if (type) {
        hm6.dc_type = type;
        $("#hm6DcType").html(hm6TypeDisplay());
        $(':focus').blur();
    }
    updateHm6();
}

function hm6DcDisplay() {
    var htmlString =
        '<div class="dropdown">' +
        '<button id="hm6DcAreaDropDown" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
        '<span class="list">' + hm6DcList[hm6.dc_area] + '</span>' +
        '<div><span class="caret"></span></div>' +
        '</button>' +
        '<ul class="dropdown-menu" aria-labelledby="dLabel">';
    for (var hm6Dc in hm6DcList) {
        if (hm6Dc != hm6.dc_area) htmlString += '<li onclick="hm6DcChange(\'' + hm6Dc + '\')"><a href="#">' + hm6DcList[hm6Dc] + "</a></li>";
    }
    htmlString +=
        '</ul>' +
        '</div>';
    return htmlString;
}

function hm6DcChange(area) {
    if (area) {
        hm6.dc_area = area;
        $("#hm6DcArea").html(hm6DcDisplay());
    }
    updateHm6();
}


function hm6ClusterChange() {
    if (document.getElementById('hm6_cluster')) {
        var cluster = document.getElementById('hm6_cluster').value;

        if (cluster < 0) {
            cluster = 0;
            document.getElementById('hm6_cluster').value = 0;
        }
        if (cluster.toString().length < 2) cluster = "00" + cluster;
        else if (cluster.toString().length < 3) cluster = "0" + cluster;
        hm6.cluster = cluster;
        updateHm6();

    }
}

function updateHm6() {
    var hm6Entries = document.getElementsByClassName("hm6");
    if (hm6Entries.length > 0) {
        for (var num = 0; num < hm6Entries.length; num++) {
            var entry = hm6Entries[num];
            var i = entry.dataset['i'];
            var j = entry.dataset['j'];
            entry.innerHTML = testList[i][j].getHost(hm6, hmng);
        }
    }
}

/* ===================================================
 ====================== HMNG PARAMs ==================
 =================================================== */
function displayHmNgOption(callback) {
    return "<tr>" +
        "<th>" +
        "HM NG" +
        "</th>" +
        "<td>" +
        "</td>" +
        "<td id='hmNgDcArea'>" +
        hmNgDcDisplay() +
        "</td>" +
        "<td>" +
        "</td>" +
        "</tr>";
}

function hmNgDcDisplay() {
    var htmlString =
        '<div class="dropdown">' +
        '<button id="hm6DcAreaDropDown" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
        '<span class="list">' + hmNgDcList[hmng.dc_area] + '</span>' +
        '<div><span class="caret"></span></div>' +
        '</button>' +
        '<ul class="dropdown-menu" aria-labelledby="dLabel">';
    for (var hmNgDc in hmNgDcList) {
        if (hmNgDc != hmng.dc_area) htmlString += '<li onclick="hmNgDcChange(\'' + hmNgDc + '\')"><a href="#">' + hmNgDcList[hmNgDc] + "</a></li>";
    }
    htmlString +=
        '</ul>' +
        '</div>';
    return htmlString;
}

function hmNgDcChange(hmNgDc) {
    if (hmNgDc) {
        hmng.dc_area = hmNgDc;
        $("#hmNgDcArea").html(hmNgDcDisplay());
    }
    updateHmNg();

}

function updateHmNg() {
    var hmNGEntries = document.getElementsByClassName("hmng");
    if (hmNGEntries.length > 0) {
        for (var num = 0; num < hmNGEntries.length; num++) {
            var entry = hmNGEntries[num];
            var i = entry.dataset['i'];
            var j = entry.dataset['j'];
            entry.innerHTML = testList[i][j].getHost(hm6, hmng);
        }
    }
}


/* ===================================================
 ====================== DEBUG ========================
 =================================================== */
$('#UDPtest').click(function () {
    asatConsole.log("start UDP Test");
    new UDPTest('rerector.aerohive.com', 12222, asatConsole);
});
$('#Test').click(function () {
    asatConsole.log("start TCP Test");

    new HTTPTest('192.168.1.4', 80, "1", asatConsole, function () {
        asatConsole.error("back");
    });
    new HTTPTest('192.168.1.4', 3000, "2", asatConsole, function () {
        asatConsole.error("back");
    });
    new HTTPTest('hm-emea-105.aerohive.com', 80, "3", asatConsole, function () {
        asatConsole.error("back");
    });
    new HTTPTest('redictor.aerohive.com', 80, "4", asatConsole, function () {
        asatConsole.error("back");
    });

});