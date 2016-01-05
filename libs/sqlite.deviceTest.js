var db = require("./sqlite.main").db;
var Service = require("./sqlite.main").Service;
var Proto = require("./sqlite.main").Proto;

function DeviceTest(row, callback){
    var device = {};
    device.TEST_ID = row.id;
    device.HOST = row.HOST;
    device.PORT = row.PORT;
    device.COMMENT = row.COMMENT;
    device.SERVICE_ID = row.SERVICE_ID;
    device.PROTO_ID = row.PROTO_ID;
    device.TEST_NAME = "";
    device.PROTO_NAME = "";
    if (device.SERVICE_ID > 0){
        Service.findById(device.SERVICE_ID, function(err, res){
            if (err) callback(err);
            else if (res) {
                device.TEST_NAME = res.SERVICE_NAME;
                if (device.PROTO_ID > 0){
                    Proto.findById(device.PROTO_ID, function(err, res){
                        if (err) callback(err);
                        else if (res) {
                            device.PROTO_NAME = res.PROTO_NAME;
                            callback(null, device);
                        } else callback(null, device);
                    })
                }
            } else callback(null, device);
        });
    } else callback(null, device);
}

function deviceTestListFormat(res, callback){
    var deviceTestList = [];
    var deviceTestNum = 0;
    for (var i = 0; i < res.length; i++){
        new DeviceTest(res[i], function(err, device){
            if (device) deviceTestList.push(device);
            deviceTestNum ++;
            if (deviceTestNum == res.length){
                callback(deviceTestList);
            }
        });
    }
}

module.exports.getAll = function(callback){
    db.findAll("DEVICE_TEST", null, null, function(err, res){
        if (err) callback(err);
        else {
            deviceTestListFormat(res, function(deviceTestList){
                callback(deviceTestList)
            });
        }
    });
};

module.exports.findByServiceId = function(SERVICE_ID, callback){
    db.findAll("DEVICE_TEST", {SERVICE_ID: SERVICE_ID}, null, function(err, res){
        if (err) callback(err);
        else {
            deviceTestListFormat(res, function(deviceTestList){
                callback(err, deviceTestList)
            });
        }
    })
};
