/**
 * Created by david on 9/6/2016.
 */
const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const db = require('../db');
const async = require('async');
var Question = require('../model/Question');
const Test = require('../model/Test');

/* GET test listing. Will list all pre/post tests.  */
router.get('/', function(req, res, next) {
    var dbConn;
    var testArray = [];
    async.series([
            function (callback) {
                db.pool.getConnection(function (err, conn) {
                    dbConn = conn;
                    callback(err,null);
                });
            },
            function (callback) {
                getAllTests(dbConn, testArray ,callback);
            }
        ],
        function (err, result ) {
            if (err) {
                dbConn.release();
                console.log(error.message + "\n" + error.stack);
                res.send('Encountered error in get(/tests),' + error.message + '<br>' + error.stack);
            }
            else {
                dbConn.release();
                res.render('tests', {tests: testArray});
            }
        } );
});

// process POST on URI /tests to update the set of tests by deleting some
router.post('/', function(req, res, next) {
    var dbConn;
    var removeTest = req.body.removeTest;
    var myresult = {test : undefined};
    removeTest = (typeof(removeTest) == 'string') ? [removeTest] : removeTest;
    async.series([
            function (callback) {
                db.pool.getConnection(function (err, conn) {
                    dbConn = conn;
                    callback(err,null);
                });
            },
            function (callback) {
                if (removeTest) {
                    deleteTests(dbConn,removeTest,callback,next);
                }
            }
        ],
        function (err, result) {
            if (err) {
                dbConn.release();
                return next(err)
            }
            else {
                res.redirect("/tests")
            }
        });

} );

// process GET on URI /tests/<id> to return a test editing page
router.get('/:tid', function(req, res, next) {
    var tid = req.params.tid;
    var dbConn;
    var myresult = {test : undefined};
    async.series([
            function (callback) {
                db.pool.getConnection(function (err, conn) {
                    dbConn = conn;
                    callback(err,null);
                });
            },
            function (callback) {
                if (tid != 'new')
                    getTest(dbConn, tid, myresult,callback, next);
                else {
                    myresult.test = new Test();
                    callback(null,null);
                }
            }
        ],
        function (err, result) {
            if (err) {
                dbConn.release();
                console.log(err.message + "\n" + err.stack);
                res.send('Encountered error in get(/tests/:tid),' + err.message + '<br>' + error.stack);
            }
            else {
                dbConn.release();
                res.render('test', {tid: tid, test: myresult.test});
            }
        })  ;

});

// process POST on URI /tests/<id> to update a test.
router.post('/:tid', function(req, res, next) {
    try {
        var tid = req.params.tid;
        var dbConn;
        var myresult = {test: undefined};
        var qidsToRemove = req.body.removeQuestion;  // will be an array if more than one, otherwise just a string
        var questionId = req.body.questionIds;  // the ids in order
        var dbConn;
        var myresult = {test: undefined};
        qidsToRemove = (typeof(qidsToRemove) == 'string') ? [qidsToRemove] : qidsToRemove;
        questionId = (typeof(questionId) == 'string') ? [questionId] : questionId;
        async.series([
                function (callback) {
                    db.pool.getConnection(function (err, conn) {
                        dbConn = conn;
                        callback(err, null);
                    });
                },
                // create a test object from the db and put in myresult
                function (callback) {
                    if (tid != 'new')
                        getTest(dbConn, tid, myresult, callback, next);
                    else callback(null,null);
                },
                // write changes to the test in the db
                function (callback) {
                    if (tid != 'new')
                        updateTest(dbConn, myresult, qidsToRemove, questionId, callback, next);
                    else {
                        try {
                            createNewTest(dbConn, req, myresult, questionId, callback, next);
                        } catch (ee) {
                            return next(ee);
                        }
                    }
                },
                // fetch the new test object from the db again
                function (callback) {
                    getTest(dbConn, myresult.test.id, myresult, callback, next);
                },
            ],
            function (err, result) {
                if (err) {
                    dbConn.release();
                    console.log(err.message + "\n" + err.stack);
                    // res.send('Encountered error in post(/tests/:tid),' + err.message + '<br>' + error.stack);
                    return next(err);
                }
                else {
                    dbConn.release();
                    res.render('test', {tid: myresult.test.id, test: myresult.test});
                }
            });

    } catch (ee) {
        return next(ee);
    }

});


// Puts all the questions into an array
function getAllTests (conn, testArray, callback) {
    conn.query("select * from preposttest",
        function (error, rows)  {
            if (error) {
                callback(error,null);
            }
            else {
                for (var i=0; i < rows.length; i++) {
                    testArray.push({id: rows[i].id, name: rows[i].name, isActive: rows[i].isActive});
                }
                callback(null,testArray);
            }
        }
    );

}

function createNewTest (conn, req, myresult, questionIds, cb, next) {

    var test = new Test();
    test.initFromRequest(req);
    myresult.test = test;
    if (questionIds)
        test.setQuestionIds(questionIds);
    async.series([
        function (callback) {
            conn.query("insert into preposttest (name) values (?)", [test.name],
                function (error, result) {
                    test.id = result.insertId;  // if the insert fails the test.id will be corrupt.
                    // Callback the toplevel series to let it know this is done
                    callback(error, test);
                });
        },
        // insert all questions into the map
        function (callback) {
            insertQuestionsInTest(conn, test, null, callback, next);
        }], cb);

}

// Gets a pretest and all of its questions (from a map).  Places the resulting object in result.test and then
// makes the callback
function getTest (conn, tid, result , callback, next) {
    conn.query("select * from preposttest where id = ?", [tid],
        function (error, rows)  {
            if (error)
                callback(error,null);
            else {
                try {
                    if (rows.length > 0) {
                        var test = new Test();
                        test.initFromRow(rows[0]);
                        result.test = test;
                        conn.query("select q.*, m.position from prepostproblem q, prepostproblemtestmap m where q.id=m.probId and m.testId=? order by m.position asc",
                            [tid],
                            function (error, qrows) {
                                if (error)
                                    callback(error, null);
                                else {
                                    try {
                                        for (var i = 0; i < qrows.length; i++) {
                                            var quest = new Question();
                                            quest.initFromRow(qrows[i]);
                                            test.addQuestion(quest);
                                        }
                                        result.test = test;
                                    } catch (ee) {
                                        return next(ee);
                                    }
                                    callback(null, test);
                                }
                            });
                    }

                    else callback(new Error("Could not find test " + tid + " in prepostTest table"));
                } catch (e) {
                    return next(e);
                }
            }
        }
    );

}

function updateTest(dbConn, myresult, qidsToRemove, questionIds, cb, next) {
    // the idea here (somewhat flawed if there is a crash during this operation) is to correctly modify the test object by deleting and inserting
    // question ids from the list of ids it maintains.  Following this we then remove all entries
    // in the prepostproblemtestmap table for this test.  We then insert entries back into the table
    // according to what is in the test object.
    try {
        var test = myresult.test;
        test.removeQuestions(qidsToRemove);  // remove question objects and ids from the test
        // add new ids into the test
        if (questionIds) {
            test.setQuestionIds(questionIds);

        }
        async.series([
                // clear the map that puts questions into a test
                function (callback) {
                    removeAllTestQuestions(dbConn, myresult.test, callback);
                },
                // insert all questions into the map
                function (callback) {
                    insertQuestionsInTest(dbConn, test, qidsToRemove, callback, next);
                },
                // update other fields of the test
                function (callback) {
                    dbConn.query("update preposttest set name=? where id=?", [test.name, test.id], callback);
                }
            ],
            function (err, result) {
                cb(err, result);
            });
    } catch (ee) {
        return next(ee);
    }
}

// Add the question ids that are in the test into the map table
function insertQuestionsInTest (conn, test, qidsToRemove, cb, next) {
    var pairs = [];
    var index = 0;
    try {
        // create an array of [position, id] pairs
        for (var i = 0; i < test.questionIds.length; i++) {
            var found = -1;
            if (qidsToRemove)
                found = qidsToRemove.indexOf(test.questionIds[i]);
            if (found == -1) {
                pairs.push([index++, test.questionIds[i]]);
            }
        }
        // do the asynchronous task over each pair in the array.
        async.forEach(pairs,
            function (pair, callback) {
                conn.query("insert into prepostproblemtestmap (probId, testId, position) values (?,?,?)",
                    [pair[1], test.id, pair[0]], callback);
            }, cb);
    } catch (ee) {
        return next(ee);
    }
}



// clear out the map for this test
function removeAllTestQuestions (conn, test, callback) {
    conn.query("delete from prepostproblemtestmap where testId=? ", [test.id], callback);
}

function deleteTests (conn, testIds, callback, next) {
    try {
        var idList = db.makeIdList(testIds);
        async.series([
            function (cb) {
                conn.query("delete from pretestassignment where pretestId in " +idList,cb) ;
            } ,
            function (cb) {
                conn.query("delete from preposttest where id in " + idList, cb)
            }
        ] ,
            function (err, res) {
                callback(err,res);
            });

  
    } catch (err) {
        return next(err);
    }

}



module.exports = router;