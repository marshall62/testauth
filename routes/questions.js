/**
 * Created by david on 8/23/2016.
 */
const express = require('express');
const mysql = require('mysql');
const router = express.Router();
const fs = require("fs");
const db = require('../db');
const multer = require('multer');
var limits = { fileSize: 100 * 1024 * 1024, files:1 };
// const upload = multer({ dest: './uploads', limits: limits });
const upload = multer({ dest: '/tmp', limits: limits });
const async = require('async');
var Question = require('../model/Question');
/*
var storage =   multer.diskStorage({

    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage : storage}).single('userPhoto');     */


// Note:  view helpers are used to generate HTML tags more efficiently.   Note:  there is some
// // confusion about this.  EJS view helpers are supposed to be included with EJS but when you call them, an error happens.
// stackOv says to install express-helpers to fix the error, but then we are no longer using the ones that should be with EJS
// // and are instead using ones from express.   See doc
// https://github.com/tanema/express-helpers/wiki        *  these are the ones that are being used.
// https://code.google.com/archive/p/embeddedjavascript/wikis/ViewHelpers.wiki

/* GET question listing. Will list all questions.  */
router.get('/', function(req, res, next) {
    var dbConn;
    var questionArray = [];
    var myresult = {questions : undefined};
    async.series([
        function (callback) {
            db.pool.getConnection(function (err, conn) {
                dbConn = conn;
                callback(err,null);
            });
        },
        function (callback) {
            getAllQuestions(dbConn, questionArray ,callback,next);
        }
        ],
        function (err, result ) {
            if (err) {
                dbConn.release();
                console.log(error.message + "\n" + error.stack);
                res.send('Encountered error in get(/questions),' + error.message + '<br>' + error.stack);
            }
            else {
                dbConn.release();
                res.render('questions', {questions: questionArray});
            }
        } );
});



// process GET on URI /questions/<id> to return a question editing page  or /questions/new for a new question editing page.
router.get('/:qid(\\d+)', function(req, res, next) {
    var qid = req.params.qid;
    var isNew = qid == 'new';  // 
    var dbConn;
    var myresult = {question : undefined};
    async.series([
        function (callback) {
            db.pool.getConnection(function (err, conn) {
                dbConn = conn;
                callback(err,null);
            });
        },
        function (callback) {
            if (isNew) {
                myresult.question = new Question();
                myresult.question.setType(1); // a better default for editing a new question
                callback(null, null);    
            }
            else
                getQuestion(dbConn, qid, myresult,callback);
        }
        ],
        function (error, result) {
            if (error) {
                dbConn.release();
                console.log(error.message + "\n" + error.stack);
                res.send('Encountered error in get(/questions/:qid),' + error.message + '<br>' + error.stack);
            }
            else {
                dbConn.release();
                res.render('question', {qid: qid, qobj: myresult.question});
            }
        })  ;

});

// process GET on URI /questions/<qid>/img  to return the image for the given question
router.get('/:qid/img', function(req, res, next) {
    var qid = req.params.qid;
    var dbconn;
    var imageData;
    async.series([
        function (callback) {
            db.pool.getConnection(function (err, conn) {
                dbConn = conn;
                callback(err,null);
            });
        },
        function (callback) {
            dbConn.query("select image from prepostproblem where id = "  + qid,
                function (error, rows) {
                    if (error)
                        callback(error, null);
                    else {
                        if (rows.length > 0)
                            imgData = rows[0].image;
                        callback(null,null);
                    }
                });
        }],
        function (error, results) {
            if (error) {
                dbConn.release();
                console.log(error.message + "\n" + error.stack);
                res.send('Encountered error in get(/questions/:qid/img),' + error.message + '<br>' + error.stack);
            }
            else {
                dbConn.release();
                res.writeHead('200', {'Content-Type': 'image/jpg'});
                res.end(imgData,'binary');
            }
        });
});




// process POST on URI /questions which deletes the questions in removeQuestion param.
router.post('/', function(req, res, next) {
    var dbConn;
    var removeQuestion = req.body.removeQuestion;  // If questions are being deleted from the list this will have value(s)
    if (!removeQuestion) {
        res.redirect("questions");
        return;
    }
    var myresult = {question : undefined};

    async.series([
            function (callback) {
                db.pool.getConnection(function (err, conn) {
                    dbConn = conn;
                    callback(err, null);
                });
            },
            function (callback) {
                // if removeQuestion has a value, this was called to change the list of questions.  If no value is in removeQuestion
                // , this is a simple request to create a new question.
                if (removeQuestion) {
                    deleteQuestions(dbConn,removeQuestion,callback);
                }
            }
            ],
            function (error, result) {
                if (error) {
                    dbConn.release();
                    console.log(error.message + "\n" + error.stack);
                    res.send('Encountered error in post(/questions/question/delete),' + error.message + '<br>' + error.stack);
                }
                else {
                    dbConn.release();
                    res.redirect("questions");
                }
            });

});

// process POST on URI /questions/<id> to update or insert a question
// Receives the multi-part form of a question as edited by the user.
// Included files will be an image and potentially images for each of a,b,c,d,e answer choices.
// if qid == 'new' this is saving a new question (without an id yet), so make qid undefined
// so this can process it correctly.
router.post('/:qid', upload.fields([{name: 'image', maxcount: 1}, {name: 'aChoiceImg', maxcount: 1}]), function (req,res,next) {
    var qid = req.params.qid;
    var removeImage = req.body.removeImage;
    if (qid == 'new')
        qid = undefined;
    var dbConn = null;
    var myresult = {question : undefined};
    // dbConn = getConnection()
    // saveQuestion(dbConn)
    // render the question
    async.series([
        // get the db connection
        function (callback) {
            db.pool.getConnection(function (err, conn) {
                dbConn = conn;
                callback(err,null);
            });
        },
        // save the question to the db.  The question object is placed in myresult
        function (callback) {
            saveQuestion(req, dbConn, callback, myresult, removeImage, qid);
        },
        function (callback) {
            getQuestion(dbConn, myresult.question.id, myresult,callback);
        }
        ],
        function (error, result) {
            if (error) {
                dbConn.release();
                console.log(error.message + "\n" + error.stack);
                res.send('Encountered error in .post(/questions/:qid)' + error.message + '<br>' + error.stack);
            }
            else {
                dbConn.release();
                res.redirect(myresult.question.id ); // do a GET on /questions/<id>
                // res.render('question', {qid: myresult.question.id, qobj: myresult.question});
            }
        });

});


// process a /questions/preview?qid=<q> request
router.get('/preview', function(req, res, next) {
    var qid = req.query.qid;
    var dbConn;
    var myresult = { question: undefined};
    async.series([
        function (callback) {
            db.pool.getConnection(function (err, conn) {
                dbConn = conn;
                callback(err,null);
            });
        },

        function (callback) {
            getQuestion(dbConn,qid,myresult,callback);
        }
    ],
        function (err, result) {
            if (err) {
                dbConn.release();
                console.log(err.message + "\n" + err.stack);
                res.send('Encountered error in get(/tests/preview/:tid),' + err.message + '<br>' + err.stack);
            }
            else {
                dbConn.release();
                res.render('questionPreview', {qid: myresult.question.id, qobj: myresult.question, tid: undefined});
            }
        });

} );


// This saves a question to the db.  If qid is not provided
// its a new question and should be inserted; o/w updated
function saveQuestion (req, conn, callback, result, removeImage, qid) {
    // if anything fails, we must pass the error to the callback here.  If things succeed
    // the callback is called in the nested function.
    try {
        var q = new Question();
        q.initFromRequest(req, qid);
        result.question = q; // stuffs the question object into the result object passed in
        if (qid)
            updateExistingQuestion(conn, q, removeImage, callback);
        else insertNewQuestion(conn, q, callback);
    } catch (err) {
        callback(err,null);
    }

}



function getQuestion (conn, qid, result , callback) {
    conn.query("select * from prepostproblem where id = ?", [qid],
        function (error, rows)  {
            if (error)
                callback(error,null);
            else {
                if (rows.length > 0) {
                    var quest = new Question();
                    quest.initFromRow(rows[0]);
                    result.question = quest;
                    callback(null, null);
                }
                else callback(new Error("Could not find question " + qid + " in prepostproblem table"));

            }
        }
    );

}

// takes a callback because this is invoked in an async.series and it needs to know when
// this completes.
function insertNewQuestion (conn, q, callback) {
    var qry, vals;
    var imgdata;
    imgdata = q.image ? fs.readFileSync(q.image[0].path) : undefined ;
    if (q.isMultiChoice()) {
        qry = "insert into prepostproblem (name, description, waitTimeSecs, ansType, " +
            "achoice, bchoice, cchoice, dchoice, echoice, answer, image, hoverText) " +
            "values (?,?,?,?,?,?,?,?,?,?,?,?)";
        vals = [q.name, q.descr, q.warnTime, q.getTypeCode(),
            q.aAns, q.bAns, q.cAns, q.dAns, q.eAns, q.answer, imgdata, q.hoverText];
    }
    else  {
        qry = "insert into prepostproblem (name, description, waitTimeSecs, ansType, " +
            "answer, image, hoverText) " +
            "values (?,?,?,?,?,?,?)";
        vals = [q.name, q.descr, q.warnTime, q.getTypeCode(),
            q.answer, imgdata, q.hoverText];
    }
    conn.query(qry, vals,
        function (error, result) {
            q.id = result.insertId;  // if the insert fails the q.id will be corrupt.
            // Callback the toplevel series to let it know this is done
            callback(error,q);
        });
}

// takes a callback because this is invoked in an async.series and it needs to know when
// this completes.
function deleteQuestions (conn, qids, cb) {
    var idlist = db.makeIdList(qids);
    async.series([
        function (callback) {
            conn.query("delete from prepostproblemtestmap where probId in " + idlist, callback);
        },
        function (callback) {
            conn.query("delete from prepostproblem where id in " + idlist, callback);
        }
    ], cb)


}

// takes a callback because this is invoked in an async.series and it needs to know when
// this completes.
function updateExistingQuestion (conn,q, removeImage, callback) {
    var qry, vals;
    var imgdata;
    if (q.image)
        imgdata = fs.readFileSync(q.image[0].path);
    // if the removeImage box is checked set the data to empty so image field is set to null
    else if (removeImage)
        imgdata = undefined;
    // if there is no uploaded image or not removeImage box checked, update without affecting the image
    if (!q.image && !removeImage) {
        qry = "update prepostproblem set name=?, description=?, waitTimeSecs=?, anstype=?, achoice=?, bchoice=?, cchoice=?, dchoice=?, echoice=?, answer=?, hoverText=? where id = ?";
        vals = [q.name,q.descr, q.warnTime, q.getTypeCode(), q.aAns, q.bAns, q.cAns, q.dAns, q.eAns, q.answer, q.hoverText,q.id];

    }

    else {
        qry = "update prepostproblem set name=?, description=?, waitTimeSecs=?, anstype=?, achoice=?, bchoice=?, cchoice=?, dchoice=?, echoice=?, answer=?, image=?, hoverText=?  where id = ?";
        vals = [q.name, q.descr, q.warnTime, q.getTypeCode(), q.aAns, q.bAns, q.cAns, q.dAns, q.eAns, q.answer, imgdata, q.hoverText, q.id];
    }
    conn.query(qry, vals,
        function (error, rows)  {
            callback(error,rows);
        }
    )
}

// Puts all the questions into an array
function getAllQuestions (conn, questionArray, callback,next) {
        conn.query("select * from prepostproblem where id >= 175",
            function (error, rows)  {
                if (error) {
                    callback(error,null);
                }
                else {
                    try {
                        for (var i = 0; i < rows.length; i++) {
                            var q = new Question();
                            q.initFromRow(rows[i]);
                            questionArray.push(q);
                        }
                        callback(null, questionArray);
                    } catch (err) {
                        return next(err);
                    }
                }
            }
        );

}


module.exports = router;

