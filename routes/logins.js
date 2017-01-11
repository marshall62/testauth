/**
 * Created with IntelliJ IDEA.
 * User: marshall
 * Date: 10/19/16
 * Time: 2:30 PM
 * To change this template use File | Settings | File Templates.
 */
"use strict";
const express = require('express');
const http = require('http');
const mysql = require('mysql');
const router = express.Router();
const async = require('async');
const db = require('../db');
const util = require('../util/util');
const config= require('../util/config');




// POST process submits of two fields: username and password as query string
// When the login is successful, the session variable userid is set to the id coming
// from the administrator table's ID.
router.post('/', function(req, res, next) {
    var user = req.body.username;
    var pw = req.body.password;
    var dbConn;
    var myresult = {userid: undefined, authenticated: undefined};
    async.series([
            function (callback) {
                authent(user,pw,myresult, callback);
            },
            function (callback) {
                if (!myresult.authenticated)
                    callback(null,null);
                else
                    db.pool.getConnection(function (err, conn) {
                        dbConn = conn;
                        callback(err,null);
                    });
            },
            function (callback) {
                if (!myresult.authenticated)
                    callback(null,null);
                else
                    getUser(dbConn, user, pw, myresult,callback);
            }
        ], function (error, result) {
        if (error) {
            if (dbConn)
                dbConn.release();
            console.log(error.message + "\n" + error.stack);
            // res.send('Encountered error in post(/login),' + error.message + '<br>' + error.stack);
            return next(error);
        }
        else {
            if (dbConn)
                dbConn.release();
            // Set the session variable to the user id.
            if (myresult.authenticated && myresult.userid) {
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
    conn.query("select id from administrator where username=?", [user],
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


function authent (user, pw, myresult, callback) {
    // should be reading some kind of init file where this could go but don't know how to
    var authentHost = config.loginServer.host;
    var authentPath = config.loginServer.path;
    var url = authentHost + authentPath + "/username/" + user + "/pw/" + pw;
    http.get(url, (res) => {
        const statusCode = res.statusCode;
        const contentType = res.headers['content-type'];

        let error;
        if (statusCode !== 200) {
            error = new Error(`Failed to reach Password Authentication server at ` + authentHost + authentPath `\n` +
                `Status Code: ${statusCode}`);
        }
        else if (!/^application\/json/.test(contentType)) {
            error = new Error(`Invalid content-type.\n` +
                `Expected application/json but received ${contentType}`);
        }
        if (error) {
            console.log(error.message);
            // consume response data to free up memory
            callback(error,null);
        }
        else {
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
                try {
                    let parsedData = JSON.parse(rawData);
                    console.log(parsedData);
                    myresult.authenticated = parsedData.result == "true";
                    callback(null, null);
                } catch (e) {
                    console.log(e.message);
                    callback(e, null);
                }
            });
        }
    }).on('error', (e) => {
        console.log(`Got error: ${e.message}`);
        callback(e,null);
    });
    }


module.exports = router;
