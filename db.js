/**
 * Created by david on 8/23/2016.
 */

var mysql = require('mysql');
const config = require('./util/config.js');

var connPool = mysql.createPool({
    connectionLimit: 10,
    host : config.db.host,
    user : config.db.user,
    password : config.db.password,
    database : config.db.database,
    'debug' : false
});

function makeDbIdList (idStrOrArray) {
    var idArray;
    if (typeof(idStrOrArray) == 'string')
        idArray = [idStrOrArray];
    else idArray = idStrOrArray;
    var ids = "(";
    idArray.forEach(function (id) {
        ids += id + ",";
    });
    // need to remove the trailing comma
    ids = ids.slice(0,ids.length-1);
    ids += ")";
    return ids;
}

var Db = module.exports = {
    pool: connPool ,
    makeIdList:  makeDbIdList

}
