var db = require("./sqlite.main").db;

function Proto(row){
    this.PROTO_ID = row.id;
    this.PROTO_NAME = row.PROTO_NAME;
}

module.exports.getAll = function(callback){
    db.findAll("PROTO", null, null, function(err, res){
        if (err) callback(err);
        else {
            var protoList = [];
            for (var i = 0; i < res.length; i++){
                protoList.push(new Proto(res[i]));
            }
            callback(null, protoList);
        }
    })
};

module.exports.findById = function(PROTO_ID, callback){
    db.findById("PROTO", PROTO_ID, null, null, function(err, res){
        if (err) callback(err);
        else if (res) callback(null, new Proto(res));
        else callback(null, null);
    })
};