var db = require("./sqlite.main").db;

function CountryCode(row){
    this.ID = row.id;
    this.CODE = row.CODE;
    this.COUNTRY = row.COUNTRY;
}

module.exports.getArray = function(callback){
    var countryCodeArray = {};
    this.getAll(function(err, res){
        if (err) console.log(err);
        else {
            for (var i in res){
                countryCodeArray[res[i].CODE] = res[i].COUNTRY;
            }
        }
        callback(countryCodeArray);
    })
};


module.exports.getAll = function(callback){
    db.findAll("COUNTRY_CODE", null, null, function(err, res){
        if (err) callback(err);
        else callback(null, res);
    })
};

module.exports.findByCode = function(COUNTRY_CODE, callback){
    db.findById("COUNTRY_CODE", COUNTRY_CODE, null, null, function(err, res){
        if (err) callback(err);
        else if (res) callback(null, res);
        else callback(null, null);
    })
};

module.exports.getAll = function(callback){
    db.findAll("COUNTRY_CODE", null, null, function(err, res){
        if (err) callback(err);
        else callback(null, res)
    });
};

