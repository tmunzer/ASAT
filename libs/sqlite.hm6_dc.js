var db = require("./sqlite.main").db;

function Hm6Dc(row){
    this.ID = row.id;
    this.AREA = row.AREA;
    this.HOST_VALUE = row.HOST_VALUE;
}

module.exports.getArray = function(callback){
    var hm6DcArray = {};
    this.getAll(function(err, res){
        if (err) console.log(err);
        else {
            for (var i in res){
                hm6DcArray[res[i].HOST_VALUE] = res[i].AREA;
            }
        }
        callback(hm6DcArray);
    })
};

module.exports.getAll = function(callback){
    db.findAll("HM6_DC", null, null, function(err, res){
        if (err) callback(err);
        else callback(null, res);
    })
};

module.exports.findById = function(HM6_DC_ID, callback){
    db.findById("HM6_DC", HM6_DC_ID, null, null, function(err, res){
        if (err) callback(err);
        else if (res) callback(null, res);
        else callback(null, null);
    })
};

module.exports.getAll = function(callback){
    db.findAll("HM6_DC", null, null, function(err, res){
        if (err) callback(err);
        else callback(null, res)
    });
};