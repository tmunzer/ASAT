var db = require("./libs/sqlite.main");
var testList = [];
var proxy = {
    configured: false,
    host: "",
    port: 0,
    auth: false,
    user: "",
    password: ""
};

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
        '<input type="button" id="button-back" class="back btn btn-default" onclick="displayFirewallTest()" value="Back"/>' +
        '<input type="button" id="button-next" class="next btn btn-default" onclick="displayFirewallDestinations(\'' + type + '\')" disabled="disabled" value="Next"/>';
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
function displayFirewallDestinationsHTML(type) {
    // change the breadcrumb status
    $(".firewall-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#firewall-test-dest").removeClass("fa-circle-o").addClass("fa-circle");
    var htmlString =
        displayProxyButton(type) +
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
            htmlString +=
                "<tr>" +
                "<td>" + testList[i][j].TEST_NAME + "</td>" +
                "<td>" + testList[i][j].HOST + "</td>" +
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
        '<input type="button" id="button-back" class="back btn btn-default" onclick="displayFirewallService(\'' + type + '\')" value="Back"/>' +
        '<input type="button" id="button-next" class="next btn btn-default" onclick="displayFirewallResult(\'' + type + '\')" value="Run Test"/>';
}

function displayFirewallDestinations(type) {
    if (testList.length == 0) {
        // select all the "selected" entries
        var selectedServices = $("a[id^='firewall-entry-'].active");
        var selectedServicesNumber = 0;
        //for each selected entry, get the destinations from the DB
        $(selectedServices).each(function () {
            var entryId = $(this).data("entry-id");
            if (type == "device") {
                db.Device.findByServiceId(entryId, function (err, res) {
                    testList.push(res);
                    selectedServicesNumber++;
                    if (selectedServicesNumber == selectedServices.length) displayFirewallDestinationsHTML(type);
                });
            } else if (type == "hivemanager") {
                db.HiveManager.findByHmVersionId(entryId, function (err, res) {
                    testList.push(res);
                    selectedServicesNumber++;
                    if (selectedServicesNumber == selectedServices.length) displayFirewallDestinationsHTML(type);
                });
            } else displayFirewallDestinationsHTML(type);
        });
    } else displayFirewallDestinationsHTML(type);
}

/* ===================================================
   ====================== FW RESULTS =================
   =================================================== */
function displayFirewallResult(type) {
    // clear the "Test Result column"
    for (var i in testList) {
        for (var j in testList[i]) {
            document.getElementById("firewall-entry-" + testList[i][j].TEST_ID).innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i>';
        }
    }
    // change the breadcrumb status
    $(".firewall-button").removeClass("fa-circle").addClass("fa-circle-o");
    $("#firewall-test-run").removeClass("fa-circle-o").addClass("fa-circle");
    // change the buttons status
    document.getElementById("firewall-action").innerHTML =
        '<input type="button" id="button-back" class="back btn btn-default" onclick="displayFirewallDestinations(\'' + type + '\')" value="Back"/>' +
        '<input type="button" id="button-next" class="next btn btn-default" onclick="displayFirewallResult()" value="Restart Test"/>';
    for (var i in testList) {
        for (var j in testList[i]) {
            var test = testList[i][j];

            //UDP
            if (test.PROTO_ID == "2") {
                if (proxy.configured){
                    document.getElementById("firewall-entry-" + test.TEST_ID).innerHTML = "<i class='fa fa-exclamation-circle' style='color: blue'></i>";
                } else {
                    new UDPTest(test.HOST, test.PORT, test.TEST_ID, asatConsole, function (err) {
                        if (err) document.getElementById("firewall-entry-" + this.test.TEST_ID).innerHTML = "<i class='fa fa-times-circle' style='color: red'></i>";
                        else document.getElementById("firewall-entry-" + this.test.TEST_ID).innerHTML = "<i class='fa fa-check-circle' style='color: green'></i>";
                    }.bind({test: test}));
                }

            // TCP
            } else if (test.PROTO_ID == "1") {
                if (test.PORT == 80){
                    new HTTPTest(test.HOST, testList[i][j].PORT, test.TEST_ID, asatConsole, proxy, function (had_error) {
                        if (had_error) document.getElementById("firewall-entry-" + this.test.TEST_ID).innerHTML = "<i class='fa fa-times-circle' style='color: red'></i>";
                        else document.getElementById("firewall-entry-" + this.test.TEST_ID).innerHTML = "<i class='fa fa-check-circle' style='color: green'></i>";
                    }.bind({test: test}));
                } else if (test.PORT == 443){
                    new HTTPSTest(test.HOST, test.PORT, test.TEST_ID, asatConsole, proxy, function (had_error) {
                        if (had_error) document.getElementById("firewall-entry-" + this.test.TEST_ID).innerHTML = "<i class='fa fa-times-circle' style='color: red'></i>";
                        else document.getElementById("firewall-entry-" + this.test.TEST_ID).innerHTML = "<i class='fa fa-check-circle' style='color: green'></i>";
                    }.bind({test: test}));
                } else {
                    if (proxy.configured){
                        document.getElementById("firewall-entry-" + test.TEST_ID).innerHTML = "<i class='fa fa-exclamation-circle' style='color: blue'></i>";
                    } else {
                        new TCPTest(testList[i][j].HOST, test.PORT, test.TEST_ID, asatConsole, function (had_error) {
                            if (had_error) document.getElementById("firewall-entry-" + this.test.TEST_ID).innerHTML = "<i class='fa fa-times-circle' style='color: red'></i>";
                            else document.getElementById("firewall-entry-" + this.test.TEST_ID).innerHTML = "<i class='fa fa-check-circle' style='color: green'></i>";
                        }.bind({test: test}));
                    }
                }
            }
        }
    }
}


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

function displayProxyButton() {
    var htmlString = "";
    if (proxy.configured) {
        htmlString =
            '<a type="button" id="button-proxy" class="btn btn-default" onclick="proxyConfiguration()">' +
            'Enable Proxy ' +
            '<i class="fa fa-check-square-o"></i>' +
            '</a>';
    } else {
        htmlString =
            '<a type="button" id="button-proxy" class="btn btn-default" onclick="proxyConfiguration()">' +
            'Enable Proxy ' +
            '<i class="fa fa-square-o"></i>' +
            '</a>';
    }
    return htmlString;
}

function proxyConfiguration(type) {
    var htmlString =
        '<div style="width: 70%; margin: auto"><h4>Proxy Configuration</h4>' +
        '<hr>' +
        '<input type="checkbox" name="proxy_conf" id="proxy_conf" onclick="enableProxyConf(this.checked)"/>' +
        '<label for="proxy_conf">Enable Proxy</label>' +
        '<br>' +
        '<label for="host" class="proxy_conf_label disabled"> Proxy IP Address/Hostname:</label>' +
        '<input type="text" class="form-control proxy_conf_input" id="proxy_host" disabled="disabled" value="' + proxy.host + '"/>' +
        '<label for="port" class="proxy_conf_label disabled"> Proxy Port:</label>' +
        '<input type="text" class="form-control proxy_conf_input" id="proxy_port" disabled="disabled" value="' + proxy.port + '"/>' +
        '<hr>' +
        '<input type="checkbox" name="proxy_auth" id="proxy_auth"  onclick="enableProxyAuth(this.checked)" class="proxy_conf_input">' +
        '<label for="proxy_auth" class="proxy_conf_label disabled">Enable Proxy Authentication</label>' +
        '<br>' +
        '<label for="proxy_user" class="proxy_auth_label disabled">Username:</label>' +
        '<input type="text" class="form-control proxy_auth_input" id="proxy_user" disabled="disabled" value="' + proxy.user + '"/>' +
        '<label for="proxy_password" class="proxy_auth_label disabled">Password:</label>' +
        '<input type="password" class="form-control proxy_auth_input" id="proxy_password" disabled="disabled" value="' + proxy.password + '"/>' +
        '</div>';
    document.getElementById("firewall-test").innerHTML = htmlString;
    document.getElementById("firewall-action").innerHTML =
        '<input type="button" id="button-back" class="back btn btn-default" onclick="displayFirewallService(\'' + type + '\')" value="Cancel"/>' +
        '<input type="button" id="button-next" class="next btn btn-default" onclick="saveProxy(\'' + type + '\')" value="Save"/>';

    document.getElementById("proxy_conf").checked = proxy.configured;
    document.getElementById("proxy_auth").checked = proxy.auth;
    enableProxyConf(proxy.configured);
}

function enableProxyConf(proxy_conf_enable) {
    $(".proxy_conf_input").each(function () {
        $(this).prop("disabled", !proxy_conf_enable);
    });

    $(".proxy_conf_label").each(function () {
        if (proxy_conf_enable) {
            $(this).removeClass("disabled");
        } else {
            $(this).addClass("disabled");
        }
    });


    if (proxy_conf_enable) {
        enableProxyAuth(document.getElementById("proxy_auth").checked);
    } else {
        asatConsole.error(document.getElementById("proxy_auth").checked);
        enableProxyAuth(false);
    }
}

function enableProxyAuth(proxy_auth_enable) {
    $(".proxy_auth_input").each(function () {
        $(this).prop("disabled", !proxy_auth_enable);
    });
    $(".proxy_auth_label").each(function () {
        if (proxy_auth_enable) {
            $(this).removeClass("disabled");
        } else {
            $(this).addClass("disabled");
        }
    });

}
function saveProxy(type) {
    if (document.getElementById("proxy_conf").checked) {
        proxy.configured = true;
        proxy.host = document.getElementById("proxy_host").value;
        proxy.port = document.getElementById("proxy_port").value;
        if (document.getElementById("proxy_auth").checked) {
            proxy.auth = true;
            proxy.user = document.getElementById("proxy_user").value;
            proxy.password = document.getElementById("proxy_password").value;
        } else {
            proxy.auth = false;
        }
    } else {
        proxy.configured = false;
    }
    displayFirewallDestinationsHTML(type);
}


$('#UDPtest').click(function () {
    asatConsole.log("start UDP Test");
    new UDPTest('rerector.aerohive.com', 12222, asatConsole);
});
$('#Test').click(function () {
    asatConsole.log("start TCP Test");

    new HTTPTest('192.168.1.4', 80, "1", asatConsole, function(){
        asatConsole.error("back");
    });
    new HTTPTest('192.168.1.4', 3000, "2", asatConsole, function(){
        asatConsole.error("back");
    });
    new HTTPTest('hm-emea-105.aerohive.com', 80, "3", asatConsole, function(){
        asatConsole.error("back");
    });
    new HTTPTest('redictor.aerohive.com', 80, "4", asatConsole, function(){
        asatConsole.error("back");
    });

});