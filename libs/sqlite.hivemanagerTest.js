var db = require("./sqlite.main").db;
var HmVersion = require("./sqlite.main").HmVersion;
var Proto = require('./sqlite.main').Proto;

function HivemanagerTest(row, callback){
    var hivemanager = {};
    hivemanager.TEST_ID = row.id;
    hivemanager.HOST = row.HOST;
    hivemanager.PORT = row.PORT;
    hivemanager.COMMENT = row.COMMENT;
    hivemanager.HM_VERSION_ID = row.HM_VERSION_ID;
    hivemanager.PROTO_ID = row.PROTO_ID;
    hivemanager.TEST_NAME = "";
    hivemanager.PROTO_NAME = "";
    if (hivemanager.HM_VERSION_ID > 0){
        HmVersion.findById(hivemanager.HM_VERSION_ID, function(err, res){
            if (err) callback(err);
            else if (res) {
                hivemanager.TEST_NAME = res.HM_VERSION_NAME;
                if (hivemanager.PROTO_ID > 0){
                    Proto.findById(hivemanager.PROTO_ID, function(err, res){
                        if (err) callback(err);
                        else if (res) {
                            hivemanager.PROTO_NAME = res.PROTO_NAME;
                            callback(null, hivemanager);
                        } else callback(null, hivemanager);
                    })
                }
            } else callback(null, hivemanager);
        });
    } else callback(null, hivemanager);
}

function deviceTestListFormat(res, callback){
    var HivemanagerTestList = [];
    var HivemanagerTesttNum = 0;
    for (var i = 0; i < res.length; i++){
        new HivemanagerTest(res[i], function(err, hivemanager){
            if (hivemanager) HivemanagerTestList.push(hivemanager);
            HivemanagerTesttNum ++;
            if (HivemanagerTesttNum == res.length){
                callback(HivemanagerTestList);
            }
        });
    }
}

module.exports.getAll = function(callback){
    db.findAll("HIVEMANAGER_TEST", null, null, function(err, res){
        if (err) callback(err);
        else {
            deviceTestListFormat(res, function(deviceTestList){
                callback(deviceTestList)
            });
        }
    });
};

module.exports.findByHmVersionId = function(HM_VERSION_ID, callback){
    db.findAll("HIVEMANAGER_TEST", {HM_VERSION_ID: HM_VERSION_ID}, null, function(err, res){
        if (err) callback(err);
        else {
            deviceTestListFormat(res, function(deviceTestList){
                callback(err, deviceTestList)
            });
        }
    })
};
