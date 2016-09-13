/**
 * Created by david on 8/23/2016.
 */

var mysql = require('mysql');

var connPool = mysql.createPool({
    connectionLimit: 10,
    host : 'localhost',
    user : 'WayangServer',
    password : 'jupiter',
    database : 'wayangoutpostdb',
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
