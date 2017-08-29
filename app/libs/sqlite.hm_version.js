var db = require("./sqlite.main").db;

function HmVersion(row){
    this.HM_VERSION_ID = row.id;
    this.HM_VERSION_NAME = row.VERSION;
}

HmVersion.prototype.getEntry = function(){
    return {ENTRY_ID: this.HM_VERSION_ID, ENTRY_NAME: this.HM_VERSION_NAME};
};

module.exports.getAll = function(callback){
    db.findAll("HM_VERSION", null, null, function(err, res){
        if (err) callback(err);
        else {
            var hmVersionList = [];
            for (var i = 0; i < res.length; i++){
                hmVersionList.push(new HmVersion(res[i]));
            }
            callback(null, hmVersionList);
        }
    })
};

module.exports.findById = function(HM_VERSION_ID, callback){
    db.findById("HM_VERSION", HM_VERSION_ID, null, null, function(err, res){
        if (err) callback(err);
        else if (res) callback(null, new HmVersion(res));
        else callback(null, null);
    })
};
