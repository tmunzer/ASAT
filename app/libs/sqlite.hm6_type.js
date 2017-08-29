var db = require("./sqlite.main").db;

function Hm6Type(row){
    this.ID = row.id;
    this.DC_TYPE = row.DC_TYPE;
    this.HOST_VALUE = row.HOST_VALUE;
}

module.exports.getArray = function(callback){
    var hm6DcTypeArray = {};
    this.getAll(function(err, res){
        if (err) console.log(err);
        else {
            for (var i in res){
                hm6DcTypeArray[res[i].HOST_VALUE] = res[i].DC_TYPE;
            }
        }
        callback(hm6DcTypeArray);
    })
};


module.exports.getAll = function(callback){
    db.findAll("HM6_TYPE", null, null, function(err, res){
        if (err) callback(err);
        else callback(null, res);
    })
};

module.exports.findById = function(HM6_DC_ID, callback){
    db.findById("HM6_TYPE", HM6_DC_ID, null, null, function(err, res){
        if (err) callback(err);
        else if (res) callback(null, res);
        else callback(null, null);
    })
};

module.exports.getAll = function(callback){
    db.findAll("HM6_TYPE", null, null, function(err, res){
        if (err) callback(err);
        else callback(null, res)
    });
};

module.exports.findByHostValue = function(hostValue, callback){
    db.customSelect("HM6_TYPE", "HOST_VALUE = " + hostValue, function(err, res){
        if (err) callback(err);
        else callback(err, res);
    })
};