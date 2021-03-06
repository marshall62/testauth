/**
 * Created by david on 9/6/2016.
 */
const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const db = require('../db');
const util = require('../util/util');
const async = require('async');
var Question = require('../model/Question');
// const Test = require('../model/Test');
const Test = require('../model/Test2');

/* GET test listing. Will list all pre/post tests.  */
router.get('/', function(req, res, next) {
    var dbConn;
    var testArray = [];
    // if no userid in the session, user is not logged in or session expired.
    if (!req.session.userid) {
        res.redirect('login');
        return;
    }
    async.series([
                function (callback) {
                    db.pool.getConnection(function (err, conn) {
                        dbConn = conn;
                        callback(err, null);
                    });
                },
                function (callback) {
                    getAllTests(dbConn, testArray, callback);
                }
            ],
            function (err, result) {
                if (err) {
                    dbConn.release();
                    console.log(error.message + "\n" + error.stack);
                    res.send('Encountered error in get(/tests),' + error.message + '<br>' + error.stack);
                }
                else {
                    dbConn.release();
                    res.render('tests', {pageContext: util.pageContext(req), tests: testArray, message: undefined});
                }
            });


});

// process POST on URI /tests to update the set of tests by deleting some
router.post('/', function(req, res, next) {
    // if no userid in the session, user is not logged in or session expired.
    if (!req.session.userid) {
        res.redirect('login');
        return;
    }
    var dbConn;
    var removeTest = req.body.removeTest;
    var myresult = {test : undefined};
    removeTest = (typeof(removeTest) == 'string') ? [removeTest] : removeTest;
    if (!removeTest) {
        res.redirect("./tests");
        return;
    }
    async.series([
            function (callback) {
                db.pool.getConnection(function (err, conn) {
                    dbConn = conn;
                    callback(err,null);
                });
            },
            function (callback) {
                deleteTests(dbConn,removeTest,callback,next);
            }
        ],
        function (err, result) {
            if (err) {
                dbConn.release();
                return next(err)
            }
            else {
                res.redirect("./tests")
            }
        });

} );

// process GET on URI /tests/new to return a test editing page
router.get('/new', function(req, res, next) {
    // if no userid in the session, user is not logged in or session expired.
    if (!req.session.userid) {
        res.redirect('../login');
        return;
    }
    var myresult = {test : undefined};
    myresult.test = new Test();
    res.render('test', {pageContext: util.pageContext(req), tid: undefined, test: myresult.test,  message: undefined});
} );

// process GET on URI /tests/<id> to return a test editing page
router.get('/:tid(\\d+)', function(req, res, next) {
    // if no userid in the session, user is not logged in or session expired.
    if (!req.session.userid) {
        res.redirect('../login');
        return;
    }
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
                res.render('test', {pageContext: util.pageContext(req), tid: tid, test: myresult.test,  message: undefined});
            }
        })  ;

});


// process GET on URI /tests/<id>/allQuestions to get all the qids in the test
router.get('/:tid/allQuestions', function(req, res, next) {
    // if no userid in the session, user is not logged in or session expired.
    if (!req.session.userid) {
        res.redirect('../login');
        return;
    }
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
                res.send('Encountered error in get(/tests/:tid/allQuestions),' + err.message + '<br>' + error.stack);
            }
            else {
                dbConn.release();
                res.json({qids: myresult.test.allQuestionIds});
            }
        })  ;

});

// post a list of qids to the test.  Return nothing of significance.
router.post ('/:tid/addQuestions', function (req,res,next) {
    var qids = req.body.ids;
    var tid = req.params.tid;
    var myresult = {test: undefined};
    var dbConn;
    async.series([
            function (callback) {
                db.pool.getConnection(function (err, conn) {
                    dbConn = conn;
                    callback(err, null);
                });
            },
            function (callback) {
                getTest(dbConn, tid, myresult, callback, next);
            },
            function (callback) {
                insertQuestionsInTest(dbConn,myresult.test,qids,true,callback,next);
            }
        ],


        function (err, result) {
            if (err) {
                dbConn.release();
                console.log(err.message + "\n" + err.stack);
                res.send('Encountered error in post(/tests/:tid/addQuestions),' + err.message + '<br>' + err.stack);
            }
            else {
                dbConn.release();
                res.json({tid: tid});
                // res.status(200);
            }
        });
});

// Posts a list of question ids to the test and sets the new order of questions to this list.
router.post ('/:tid/questionOrder/', function (req,res,next) {
    var qids = req.body.ids;
    var tid =  req.params.tid;
    var myresult = {test: undefined};
    console.log(qids);
    var dbConn;
    async.series([
        function (callback) {
            db.pool.getConnection(function (err, conn) {
                dbConn = conn;
                callback(err, null);
            });
        },
        function(callback) {
            getTest(dbConn,tid,myresult,callback,next);
        } ,
        function (callback) {
            // removes the questions and re-adds them
            setTestQuestions(dbConn,myresult,qids,callback,next);
        }],
        function (err, result) {
            if (err) {
                dbConn.release();
                console.log(err.message + "\n" + err.stack);
                res.send('Encountered error in get(/tests/:tid/questionOrder),' + err.message + '<br>' + err.stack);
            }
            else {
                dbConn.release();
                res.json({tid: tid});
                // res.status(200);
            }
        })  ;
});



// POST.  Remove a question from the test's list of questions.
router.post('/:tid/removeQuestion/:qid', function (req, res, next) {
    var dbConn;
    var tid = req.params.tid;
    var qid = [req.params.qid];   // make an array of one question
    var myresult = {test: undefined};
    async.series([
        function (callback) {
            db.pool.getConnection(function (err, conn) {
                dbConn = conn;
                callback(err, null);
            });
        },
        function (callback) {
            getTest(dbConn,tid,myresult,callback,next);
        } ,
        // remove the question from the test, then remove all questions from the map in the db
        function (callback) {
            myresult.test.removeQuestions(qid);
            removeAllTestQuestions(dbConn,myresult.test,callback);
            // removeTestQuestion(dbConn,tid,qid,callback) ;

        }, // insert all questions into the map
        function (callback) {
                insertQuestionsInTest(dbConn, myresult.test, myresult.test.allQuestionIds, false, callback, next);
            }],
        function (err, result) {
            if (err) {
                dbConn.release();
                console.log(err.message + "\n" + err.stack);
                res.send('Encountered error in get(/tests/:tid/removeQuestion/:qid),' + err.message + '<br>' + error.stack);
            }
            else {
                dbConn.release();
                res.json({tid: tid, qid: qid});
                // res.status(200);
            }
        })  ;
    }
);


// process POST on URI /tests/<id> to update a test.
router.post('/:tid', function(req, res, next) {
    // if no userid in the session, user is not logged in or session expired.
    if (!req.session.userid) {
        res.redirect('../login');
        return;
    }
    try {
        var tid = req.params.tid;
        var dbConn;
        var myresult = {test: undefined};
        var questionId = req.body.questionIds;  // the ids in order
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
                    if (tid != 'new') {
                        myresult.test.name = req.body.name;
                        myresult.test.isActive = req.body.isActive ? 1 : 0;
                        updateTest(dbConn, myresult, questionId, callback, next);
                    }
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
                    res.render('test', {pageContext: util.pageContext(req), tid: myresult.test.id, test: myresult.test,  message: undefined});
                }
            });

    } catch (ee) {
        return next(ee);
    }

});


// process URLs like /tests/preview?qid=<q>&tid=<t>
// Valid combos:

// o  Just tid:  Show a preview of the first question in the test with links to the question editor and the test editor
// o  tid and qid:  Show a preview of the next question in the test that follows question <q> with appropriate links to editors
//   If a question cannot be found for a test, it goes to the test editor.
router.get('/preview', function(req, res, next) {
    // if no userid in the session, user is not logged in or session expired.
    if (!req.session.userid) {
        res.redirect('../login');
        return;
    }
    var qid = req.query.qid;
    var tid = req.query.tid;
    var isLastQ = false;
    var dbConn;
    var myresult = {question : undefined, test: undefined};
    async.series([
        function (callback) {
            db.pool.getConnection(function (err, conn) {
                dbConn = conn;
                callback(err,null);
            });
        },
        function (callback) {
            getTest(dbConn, tid, myresult,callback, next);
        },

        function (callback) {
            if (tid && qid) {
                // get the next question object after qid out of the test object
                nextQuest = getNextQuestion(myresult.test, qid); // will return null if at last question in test
                if (nextQuest) {
                    myresult.question = nextQuest;
                    myresult.qid = nextQuest.id;
                }
                else isLastQ = true;
                callback(null,null);
            }
            else if (tid) {
                if (myresult.test.allQuestions.length > 0) {
                    myresult.question = myresult.test.allQuestions[0];
                    myresult.qid = myresult.test.allQuestionIds[0];
                    callback(null,null);
                }
                else if (myresult.test.allQuestions.length == 0)
                    callback(null,null);

                // The test has no questions, so we can't preview it,
                else callback(new Error("This Test has no questions.  Cannot preview."), null);
            }

        }
    ],
        function (err, result) {
            if (err) {
                dbConn.release();
                console.log(err.message + "\n" + err.stack);
                res.send('Encountered error in get(/tests/preview),' + err.message + '<br>' + err.stack);
            }
            else {
                dbConn.release();

                if (isLastQ)
                    res.render('test', {pageContext: util.pageContext(req), test: myresult.test, tid: tid,  message: undefined});
                else if (myresult.test.allQuestions.length == 0)
                    res.render('test', {pageContext: util.pageContext(req), test: myresult.test, tid: tid, message: 'There are no questions in this test'});
                else
                    res.render('questionPreview', {pageContext: util.pageContext(req), qid: myresult.qid, qobj: myresult.question, tid: tid});
            }
        });

} );

//  find the qid question in the test and return the question after that or null
function getNextQuestion (test, qid) {
    var qs = test.allQuestions;
    var qids = test.allQuestionIds;
    for (var i=0;i<qs.length-1;i++) {
        if (qids[i] == qid)
            return qs[i+1]; // the next question;
    }
    return null;
}


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
    if (questionIds) {
        // test.setQuestionIds(questionIds);
        test.allQuestionIds = questionIds;
    }
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
                    if (questionIds)
                        insertQuestionsInTest(conn, test, null, false, callback, next);
                    else
                        callback(null,null);
                }],
            cb);

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

// Removes the questions from the test->question map and then sets it to have the new ones.
function setTestQuestions (dbConn, myresult, qids, cb, next) {
    async.series([
        // clear the map that puts questions into a test
        function (callback) {
            removeAllTestQuestions(dbConn, myresult.test, callback);
        },
        // insert all questions into the map
        function (callback) {
            insertQuestionsInTest(dbConn, myresult.test, qids, false, callback, next);
        }],
        function (err, result) {
            cb(err, result);
        });

}

function updateTest(dbConn, myresult, questionId, cb, next) {

    try {
        var test = myresult.test;
        // add new ids into the test
        if (questionId)
            test.addQuestion(questionId);

        async.series([
                // insert all questions into the map
                function (callback) {
                    if (questionId)
                        addQuestionToTest(dbConn, test, questionId, callback);
                    else callback(null,null);
                },
                // update other fields of the test
                function (callback) {
                    dbConn.query("update preposttest set name=?, isActive=? where id=?", [test.name, test.isActive, test.id], callback);
                }
            ],
            function (err, result) {
                cb(err, result);
            });
    } catch (ee) {
        return next(ee);
    }
}

// a single question has been added to the test.  It will be LAST in the test's question list.
// Now we add it to the map table.
function addQuestionToTest (conn, test, qid, cb) {
    var seqPos=test.allQuestions.length-1; // sequence positions stored in db are zero-based
    conn.query("insert into prepostproblemtestmap (probId, testId, position) values (?,?,?)",
        [qid, test.id, seqPos], cb);

}

// Add the question ids that are in the test into the map table
function insertQuestionsInTest(conn, test, qids, addAtEnd, cb, next) {
    var pairs = [];
    var index = 0;
    if (addAtEnd)
        index = test.allQuestions.length;
    try {
        if (! qids)
            cb(null,null);

        // create an array of [position, id] pairs
        for (var i = 0; i < qids.length; i++) {
            pairs.push([i+index, qids[i]]);
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

function removeTestQuestion (conn, tid, qid, callback) {
    conn.query("delete from prepostproblemtestmap where testId=? and probId=?", [tid,qid], callback);
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