/**
 * Created with IntelliJ IDEA.
 * User: marshall
 * Date: 10/19/16
 * Time: 2:30 PM
 * To change this template use File | Settings | File Templates.
 */
const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const async = require('async');
const db = require('../db');
const util = require('../util/util');




// POST process submits of two fields: username and password as query string
// When the login is successful, the session variable userid is set to the id coming
// from the administrator table's ID.
router.post('/', function(req, res, next) {
    var user = req.body.username;
    var pw = req.body.password;
    var dbConn;
    var myresult = {userid: undefined};
    async.series([
            function (callback) {
                db.pool.getConnection(function (err, conn) {
                    dbConn = conn;
                    callback(err,null);
                });
            },
            function (callback) {
                getUser(dbConn, user, pw, myresult,callback);
            }
        ], function (error, result) {
        if (error) {
            dbConn.release();
            console.log(error.message + "\n" + error.stack);
            res.send('Encountered error in post(/login),' + error.message + '<br>' + error.stack);
        }
        else {
            dbConn.release();
            // Set the session variable to the user id.
            if (myresult.userid) {
                req.session.userid = myresult.userid;
                res.redirect("tests");
            }
            else {
                res.render('login', {pageContext: util.pageContext(req), message: 'User not found.  Try again.'});
            }
        }

    });


});

// GET show the login page
router.get('/', function(req, res, next) {
    res.render('login', {pageContext: util.pageContext(req), message: undefined });


});



function getUser (conn, user, pw, result , callback) {
    conn.query("select id from administrator where username=? and password=?", [user,pw],
        function (error, rows)  {
            if (error)
                callback(error,null);
            else {
                if (rows.length > 0) {
                    result.userid = rows[0].id;
                    callback(null, null);
                }
                else {
                    // user/pw not found so don't set the result.userid
                    callback(null,null);
                }

            }
        }
    );

}


module.exports = router;
