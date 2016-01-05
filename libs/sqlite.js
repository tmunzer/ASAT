var file = "./asat.sqlite";
var sqlite3 = require("sqlite3");
var fs = require("fs");

var Sqlite = function(){
    var exists = fs.existsSync(file);
    var db = new sqlite3.Database(file);
    this.db = db;
    this.db.serialize(function() {
        if(!exists) {
            db.run('CREATE TABLE "DEVICE_TEST" (' +
                '"id" INTEGER PRIMARY KEY, ' +
                '"HOST" VARCHAR(90) DEFAULT (null) ,' +
                '"PORT" INT,' +
                '"PROTO_ID" INT,' +
                '"SERVICE_ID" INT,' +
                '"COMMENT" TEXT)');
            db.run('CREATE TABLE "HIVEMANAGER_TEST" (' +
                '"id" INTEGER PRIMARY KEY, ' +
                '"HOST" VARCHAR(90) DEFAULT (null) ,' +
                '"PORT" INT,' +
                '"PROTO_ID" INT,' +
                '"HM_VERSION_ID" INT,' +
                '"COMMENT" TEXT)');
            db.run('CREATE TABLE "PROTO" (' +
                '"id" INTEGER PRIMARY KEY, ' +
                '"PROTO_NAME" VARCHAR(3))');
            db.run('CREATE TABLE "SERVICE" (' +
                '"id" INTEGER PRIMARY KEY, ' +
                '"SERVICE_NAME" VARCHAR(60))');
            db.run('CREATE TABLE "HM_VERSION" (' +
                '"id" INTEGER PRIMARY KEY, ' +
                '"VERSION" VARCHAR(60))');
            db.run("INSERT INTO SERVICE VALUES (1, 'HiveManager 6')");
            db.run("INSERT INTO SERVICE VALUES (2, 'HiveManager NG')");
            db.run("INSERT INTO SERVICE VALUES (3, 'IDManager')");
            db.run("INSERT INTO SERVICE VALUES (4, 'Redirector')");
            db.run("INSERT INTO PROTO VALUES (1, 'TCP')");
            db.run("INSERT INTO PROTO VALUES (2, 'UDP')");
            db.run("INSERT INTO DEVICE_TEST VALUES (1, 'redirector.aerohive.com', '12222', '2', '4', '')");
        }
    });
};

Sqlite.prototype.customSelect = function (table, filter_string, callback) {
    console.log('SELECT * FROM ' + table + " WHERE " + filter_string);
    this.db.all('SELECT * FROM ' + table + " WHERE " + filter_string, function (err, ret) {
        if (err) {
            console.log(err);
        }
        callback(err, ret);
    });
};

Sqlite.prototype.customJoin = function (fields, table1, table2, table1JoinId, table2JoinId, filterString, callback) {
    if (fields == null) {
        fields = "*";
    }
    var queryString = 'SELECT ' + fields + ' FROM ' + table1 + " INNER JOIN " + table2 +
        " ON " + table1JoinId + " = " + table2JoinId +
        " WHERE " + filterString;
    console.log(queryString);
    this.db.all(queryString, function (err, ret) {
        if (err) {
            console.log(err);
        }
        callback(err, ret);
    });
};

Sqlite.prototype.updateDB = function (table, rowId, entries, callback) {
    var updateString = "";
    var fieldNumber = 0;
    for (var entry in entries) {
        if (entry == 'password' || entry == "sshPassword") {
            if (entries[entry] != "") {
                if (fieldNumber != 0) {
                    updateString += ",  ";
                }
                if (entry == 'sshPassword') {
                    updateString += entry + "='" + entries[entry] + "'";
                } else {
                    updateString += entry + "='" + createHash(entries[entry]) + "'";
                }
                fieldNumber++;
            }
        } else {
            if (fieldNumber != 0) {
                updateString += ",  ";
            }
            updateString += entry + "='" + entries[entry] + "'";
            fieldNumber++;
        }
    }
    updateString = 'UPDATE ' + table + ' SET ' + updateString + ' WHERE id=' + rowId + ";";
    console.log(updateString);
    this.db.run(updateString, function (err) {
        if (err) {
            console.log(err);
        }
        callback(err);
    })
};

Sqlite.prototype.insertDB = function (table, rows, callback) {
    var insertFields = "";
    var insertValues = "";
    var fieldNumber = 0;
    for (var field in rows) {
        if (fieldNumber != 0) {
            insertFields += ",  ";
            insertValues += ",  ";
        }
        if (field == 'password') {
            if (rows[field] != "") {
                insertFields += field;
                insertValues += "'" + createHash(rows[field]) + "'";
                fieldNumber++;
            }
        } else {
            insertFields += field;
            insertValues += '"' + rows[field] + '"';
            fieldNumber++;
        }
    }
    var insertString = 'INSERT INTO ' + table + ' (' + insertFields + ') VALUES (' + insertValues + ");";
    console.log(insertString);
    this.db.run(insertString, function (err) {
        if (err) {
            console.log(err);
        }
        callback(err, this.lastID);
    });
};

processOptions = function (rOptions) {
    var options = rOptions || {};
    var columnsString = "";
    var orderByString = "";
    var optionNumber = 0;
    if (options.hasOwnProperty("columns")) {
        optionNumber = 0;
        for (var column in options['columns']) {
            if (optionNumber != 0) {
                columnsString += ", ";
            }
            columnsString += options['columns'][column];
            optionNumber++;
        }
    } else {
        columnsString = "*";
    }
    if (options.hasOwnProperty("orderBy")) {
        orderByString = " ORDER BY " + options['orderBy'];
    } else {
        orderByString = "";
    }
    return {"columns": columnsString, "orderBy": orderByString};
};

processFilters = function (filters) {
    var filterString = "";
    if (filters != null) {
        var filterNum = 0;
        for (var filterName in filters) {
            if (filterNum != 0) {
                filterString += " AND "
            }
            filterString += filterName + "='" + filters[filterName] + "'";
            filterNum++;
        }
        filterString = " WHERE (" + filterString + ")";
    }
    return filterString;
};

Sqlite.prototype.findOne = function (table, filters, options, callback) {
    /**
     Find the first row matching the fields
     Table: Table to request
     Fields: object {fieldName: fieldValue}
     Options: object {option: []} with the following options (optionals)
     columns: columns to retrieve
     orderBy: how to sort the result
     */
    var filterString = processFilters(filters);
    var rOptions = processOptions(options);
    var selectString = "SELECT " + rOptions.columns + " FROM " + table + filterString;
    console.log(selectString);
    this.db.get(selectString, function (err, ret) {
        if (err) {
            console.log(err);
        }
        callback(err, ret);
    });
};

Sqlite.prototype.findAll = function (table, filters, options, callback) {
    /**
     Find the rows matching the fields
     Table: Table to request
     Fields: object {fieldName: fieldValue}
     Options: object {option: []} with the following options (optionals)
     columns: columns to retrieve
     orderBy: how to sort the result
     */
    var filterString = processFilters(filters);
    var rOptions = processOptions(options);
    var selectString = "SELECT " + rOptions.columns + " FROM " + table + filterString;
    console.log(selectString);
    this.db.all(selectString, function (err, ret) {
        if (err) {
            console.log(err);
        }
        callback(err, ret);
    });
};

Sqlite.prototype.findById = function (table, rowId, filters, options, callback) {
    /**
     Get one row by its ID
     Table: Table to request
     Options: object {option: []} with the following options (optionals)
     columns: columns to retrieve
     orderBy: how to sort the result
     */
    if (rowId >= 0) {
        var rOptions = processOptions(options);
        filters = filters || {};
        filters['id'] = rowId;
        var filterString = processFilters(filters);
        var getString = "SELECT " + rOptions.columns + " FROM " + table + filterString;
        console.log("FindById: " + getString);
        this.db.get(getString, function (err, ret) {
            if (err && err != "") {
                console.log(err);
                console.log(ret);
            }
            callback(err, ret);
        });
    } else {
        callback(null, null);
    }

};


Sqlite.prototype.deleteById = function (table, rId, callback) {
    this.db.run("DELETE FROM " + table + " WHERE id = " + rId, function (err, ret) {
        if (err) {
            console.log(err);
        }
        callback(err, ret);
    });
};

module.exports.init = Sqlite;

