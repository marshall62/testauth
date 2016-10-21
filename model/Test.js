/**
 * Created by david on 9/6/2016.
 */
var Test = function () {
    this.id=undefined;
    this.name=undefined;
    this.isActive=undefined;
    this.questions = [];  // question objects
    this.questionIds = [];
}

// initialize properties based on a request object
// id is optional.  Not included when the question is newly created.
Test.prototype.initFromRequest = function (req, id) {
    this.name = req.body.name;  
    this.isActive = req.body.isActive;
}

// initialize properties based on a row from the question table in the db
Test.prototype.initFromRow = function (row) {
    this.id = row.id;
    this.name = row.name;
    this.isActive = row.isActive;
    
}

Test.prototype.setQuestionIds = function (ids) {
    this.questionIds = ids;
}

Test.prototype.addQuestionId = function (id) {
    // This should be called in order so that pushing is acceptable
    this.questionIds.push(id);
}

Test.prototype.addQuestion = function (q) {
    this.questions.push(q);
    this.questionIds.push(q.id);
}

Test.prototype.removeQuestions = function (qids) {
    if (qids) {
        for (var j=0;j<qids.length;j++) {
            var loc = this.questionIds.indexOf(parseInt(qids[j]));
            if (loc >= 0)
                this.questionIds.splice(loc,1);
            for (var i=0;i<this.questions.length; i++) {
                if (this.questions[i].id == qids[j]) {
                    this.questions.splice(i,1);
                }
            }
        };
    }
    return this.questions;
}


// An example of why classes in Javascript are not real:   The forEach wipes out the binding of the variable 'this' as
    // it maps the function over qids.   this.questions becomes undefined
// Test.prototype.removeQuestions = function (qids) {
//     if (qids) {
//         qids.forEach(function (id) {
//             for (var i=0;i<this.questions.length; i++) {
//                 if (this.questions[i].id == id) {
//                     this.questions.splice(i,1);
//                 }
//             }
//         });
//     }
//     return this.questions;
// }

Test.prototype.isMultiChoice = function () {
    return this.type == MULTI_CHOICE;
}

module.exports = Test;

