/**
 * Created by david on 12/14/2016.
 */
"use strict";
var test2 = class Test {

    constructor () {
        this.id=undefined;
        this.name=undefined;
        this.isActive=undefined;
        this.questions = [];   // question objects
        this.questionIds = [];
    }

    initFromRequest (req, id) {
        this.name = req.body.name;
        this.isActive = req.body.isActive;
    }

    initFromRow (row) {
        this.id = row.id;
        this.name = row.name;
        this.isActive = row.isActive;
    }


    get allQuestions () {
        return this.questions;
    }

    get allQuestionIds () {
        return this.questionIds;
    }

    set allQuestionIds (ids) {
        this.questionIds = ids;
    }

    addQuestionId (id) {
        // This should be called in order so that pushing is acceptable
        this.questionIds.push(id);
    }

    addQuestion (q) {
        this.questions.push(q);
        this.questionIds.push(q.id);
    }

    removeQuestions (qids) {
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

    isMultiChoice () {
        return this.type == MULTI_CHOICE;
    }
}

module.exports = test2;