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
const db = require('../db');
const async = require('async');

// The login form submits two fields: username and password as query string
router.get('/', function(req, res, next) {
    var user = req.query.username;
    var pw = req.query.password;

});
