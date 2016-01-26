function Console(){
    return this;
}

Console.prototype.log = function(text){
    $('#console').append("<span> " + getTime() + " - " + text + "</span><br>");
    document.getElementById("console").scrollTop = document.getElementById("console").scrollHeight;
    console.log(text);
};
Console.prototype.error = function(text){
    $('#console').append("<span> " + getTime() + " - </span><span style='color: red;'>error</span><span> - " + text + "</span><br>");
    document.getElementById("console").scrollTop = document.getElementById("console").scrollHeight;
    console.log(text);
};
Console.prototype.warning = function(text){
    $('#console').append("<span> " + getTime() + " - </span><span style='color: orange;'>warning</span><span> - " + text + "</span><br>");
    document.getElementById("console").scrollTop = document.getElementById("console").scrollHeight;
    console.log(text);
};
Console.prototype.info = function(text){
    $('#console').append("<span> " + getTime() + " - </span><span style='color: green;'>info</span><span> - " + text + "</span><br>");
    document.getElementById("console").scrollTop = document.getElementById("console").scrollHeight;
    console.log(text);
};
Console.prototype.debug = function(text){
    $('#console').append("<span> " + getTime() + " - </span><span style='color: dodgerblue;'>debug</span><span> - " + text + "</span><br>");
    document.getElementById("console").scrollTop = document.getElementById("console").scrollHeight;
    console.log(text);
};

function getTime(){
    var now = new Date();
    var hours = now.getHours().toString();
    if (hours.length < 2){
        hours = "0"+hours;
    }
    var minutes = now.getMinutes().toString();
    if (minutes.length < 2){
        minutes = "0"+minutes;
    }
    var seconds = now.getSeconds().toString();
    if (seconds.length < 2){
        seconds = "0"+seconds;
    }
    var milli = now.getMilliseconds().toString();
    if (milli.length < 2){
        milli = "00"+milli;
    } else if (milli.length < 3) {
        milli = "0" + milli
    }
    return hours + ":" + minutes +":"+seconds+"."+milli;
}
