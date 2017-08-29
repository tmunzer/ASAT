var db = require("./sqlite.main").db;

function Service(row){
    this.SERVICE_ID = row.id;
    this.SERVICE_NAME = row.SERVICE_NAME;
}

Service.prototype.getEntry = function(){
    return {ENTRY_ID: this.SERVICE_ID, ENTRY_NAME: this.SERVICE_NAME};
};

module.exports.getAll = function(callback){
    db.findAll("SERVICE", null, null, function(err, res){
        if (err) callback(err);
        else {
            var serviceList = [];
            for (var i = 0; i < res.length; i++){
                serviceList.push(new Service(res[i]));
            }
            callback(null, serviceList);
        }
    })
};

module.exports.findById = function(SERVICE_ID, callback){
    db.findById("SERVICE", SERVICE_ID, null, null, function(err, res){
        if (err) callback(err);
        else if (res) callback(null, new Service(res));
        else callback(null, null);
    })
};
