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

function resumeFormGroupState(formGroup, value) {
    var div = $('div.' + formGroup);
    if (value) {
        div.removeClass("disabled").addClass("enabled");
        $("input." + formGroup).prop("disabled", false);
        $("span." + formGroup).each(function () {
            $(this).removeClass("disabled").addClass("enabled");
        });
        $("button." + formGroup).removeClass("disabled").addClass("enabled");
    }
    else {
        div.addClass("disabled").removeClass("enabled");
        $("input." + formGroup).prop("disabled", true);
        $("span." + formGroup).each(function () {
            $(this).addClass("disabled").removeClass("enabled");
        });
        $("button." + formGroup).addClass("disabled").removeClass("enabled");
    }
}


function valideateIP(value) {
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
        return valideateIP(value);
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
