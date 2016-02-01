function formGroupState(formGroup, event) {
    var div = $('div.' + formGroup);
    if (div.hasClass("disabled")) {
        div.removeClass("disabled").addClass("enabled");
        $("input." + formGroup).prop("disabled", false);
        $("span." + formGroup).each(function () {
            $(this).removeClass("disabled").addClass("enabled");
        });
        $("button." + formGroup).removeClass("disabled").addClass("enabled");
    }
    else {
        if (event.target.nodeName == "DIV" || event.target.nodeName == "I") {
            div.addClass("disabled").removeClass("enabled");
            $("input." + formGroup).prop("disabled", true);
            $("span." + formGroup).each(function () {
                $(this).addClass("disabled").removeClass("enabled");
            });
            $("button." + formGroup).addClass("disabled").removeClass("enabled");
        }
    }
}
function formGroupState2(formGroup) {
    var elem = $('#' + formGroup);
    if (elem.hasClass("fa-square-o")) {
        elem.removeClass("fa-square-o").addClass("enabled").addClass("fa-check-square-o");
        $("input." + formGroup).prop("disabled", false);
        $('input#switch-' + formGroup).prop('disabled', false);
        $("span." + formGroup).each(function () {
            $(this).removeClass("disabled").addClass("enabled");
        });
        $("button." + formGroup).removeClass("disabled").addClass("enabled");
    }
    else {
        elem.addClass("fa-square-o").removeClass("enabled").removeClass("fa-check-square-o");
        $("input." + formGroup).prop("disabled", true);
        $('input#switch-' + formGroup).prop('disabled', true);
        $("span." + formGroup).each(function () {
            $(this).addClass("disabled").removeClass("enabled");
        });
        $("button." + formGroup).addClass("disabled").removeClass("enabled");
    }
}

function resumeFormGroupState(formGroup, value) {
    if (value.enable) {
        $('#' + formGroup).removeClass("fa-square-o").addClass("enabled").addClass("fa-check-square-o");
        $("button." + formGroup).removeClass("disabled").addClass("enabled");
        if (value.hasOwnProperty("configured")) {
            $("input.switch-" + formGroup).prop("disabled", !value.configured);
        }
    } else {
        $('#' + formGroup).addClass("fa-square-o").removeClass("enabled").removeClass("fa-check-square-o");
        $("button." + formGroup).addClass("disabled").removeClass("enabled");
        if (value.hasOwnProperty("configured")) {
            $("input.switch-" + formGroup).prop("disabled", true);
        }
    }
    $("input." + formGroup).prop("disabled", !value.enable);
    var formSwitch = $("#switch-" + formGroup);
    formSwitch.prop("disabled", !value.enable);
    formSwitch.prop("checked", value.configured);

}


function validateIP(value) {
    var valueSplitted = value.split(".");
    if (valueSplitted.length != 4) return false;
    else {
        for (var i in valueSplitted) {
            if (valueSplitted[i] == "") return false;
            else if (!(valueSplitted[i] <= 255)) return false;
        }
    }
    return true;
}

function validateFQDN(value) {
    var fqdnRegExp = new RegExp("(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)");
    if (!(fqdnRegExp.test(value))) {
        return validateIP(value);
    }
    return true;
}

function portKeyPress(elem, event) {
    if (event.charCode >= 48 && event.charCode <= 57) {
        if (event.target.valueAsNumber < 0) {
            $('#' + elem).val('0');
            return false;
        } else return true;
    } else return false;
}
function vlanKeyPress(event) {
    return (event.charCode >= 48 && event.charCode <= 57);
}

function ipKeyPress(event) {
    return ((event.charCode >= 48 && event.charCode <= 57) || event.charCode == 46);
}

function networkKeyPress(event) {
    return (event.charCode >= 46 && event.charCode <= 57);
}


/* ===================================================
 ====================== QTIP =========================
 =================================================== */

function displayResultIcon(prefix, fieldId, error, warning, success, info, qtip) {
    if (error) {
        $("#" + prefix + "-" + fieldId).html("<i id='" + prefix + "-result-" + fieldId + "' class='fa fa-times-circle' style='color: red'></i>");
    } else if (warning) {
        $("#" + prefix + "-" + fieldId).html("<i id='" + prefix + "-result-" + fieldId + "' class='fa fa-warning' style='color: orange'></i>");
    } else if (info) {
        $("#" + prefix + "-" + fieldId).html("<i id='" + prefix + "-result-" + fieldId + "' class='fa fa-exclamation-circle' style='color: dodgerblue'></i>");
    } else {
        $("#" + prefix + "-" + fieldId).html("<i id='" + prefix + "-result-" + fieldId + "' class='fa fa-check-circle' style='color: green'></i>");
    }
    if (qtip) displayQtip(prefix + "-result-" + fieldId, error, warning, success, info)
}

function displayQtip(fieldId, error, warning, success, info) {
    var qtipText = "";
    var qtipTitle = "";
    var qtipClass = "";
    if (error) {
        qtipTitle = "Error";
        qtipText = error;
        qtipClass = "error";
    } else if (warning) {
        qtipTitle = "Warning";
        qtipText = warning;
        qtipClass = "warning";
    } else if (info) {
        qtipTitle = "Proxy enabled";
        qtipText = info;
        qtipClass = "proxy";
    } else {
        qtipTitle = "Success";
        qtipText = success;
        qtipClass = "success";
    }

    $("#" + fieldId).qtip({
        content: {
            text: qtipText,
            title: qtipTitle
        },
        position: {
            my: "right center",
            at: "left center"
        },
        style: {
            classes: "qtip qtip-shadow qtip-" + qtipClass
        }
    })
}
