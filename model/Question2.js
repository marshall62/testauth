/**
 * Created by david on 12/16/2016.
 */
// don't change these without checking question.ejs which uses them in a form


"use strict";
var q = class Question {

    // need to use static get methods because ES doesn't allow static const properties.
    static get MULTI_CHOICE() {
        return 'multiChoice';
    }
    static get SHORT_ANSWER() {
        return 'shortAnswer';
    }
    static get LONG_ANSWER() {
        return 'longAnswer';
    }
    static get NO_CORRECT_ANSWER() {
        return 'noneCorrect';
    }
    static get NO_TIME_LIMIT() {
        return 'unlimited';
    }


    constructor() {

    }

    initFromRequest(req, id) {
        this.descr = req.body.descr;
        this.id = id;
        this.name = req.body.name;
        this.warnTime = req.body.warnTime;
        if (this.warnTime == Question.NO_TIME_LIMIT)
            this.warnTime = undefined;
        if (req.files.image)
            this.image = req.files.image; // this is the image file that gets put in a folder by multer
        this.type = req.body.type;  // one of shortAnswer, multiChoice, longAnswer
        if (this.isMultiChoice()) {
            this.aAns = req.body.aAns ? req.body.aAns.trim() : undefined;
            this.bAns = req.body.bAns ? req.body.bAns.trim() : undefined;
            this.cAns = req.body.cAns ? req.body.cAns.trim() : undefined;
            this.dAns = req.body.dAns ? req.body.dAns.trim() : undefined;
            this.eAns = req.body.eAns ? req.body.eAns.trim() : undefined;
            this.answer = req.body.multiChoiceCorrectAnswer;
            // form will send multiChoiceCorrectAnswer=noneCorrect if that radio button is selected.
            // Set the answer field to undef so that null goes into db for the answer.
            if (this.answer == Question.NO_CORRECT_ANSWER)
                this.answer = undefined;
        }
        else {
            this.answer = req.body.answer ? req.body.answer.trim() : undefined;
        }
        this.hoverText = req.body.hoverText;
    }

    initFromRow(row) {
        this.id = row.id;
        this.name = row.name;
        this.descr = row.description;
        this.answer = row.answer;
        this.warnTime = row.waitTimeSecs;
        if (!this.warnTime)
            this.warnTime = Question.NO_TIME_LIMIT;
        var typeCode = row.ansType; // one of 0,1,2
        this.setType(typeCode);
        if (this.isMultiChoice()) {
            this.aAns = row.aChoice;
            this.bAns = row.bChoice;
            this.cAns = row.cChoice;
            this.dAns = row.dChoice;
            this.eAns = row.eChoice;
        }
        this.imageURL = row.url;  // if images are just URLs, then this will be the image url.  Otherwise the line below is the image
        this.image = row.image;
        this.hoverText = row.hoverText;
    }

    isMultiChoice  () {
        return this.type == Question.MULTI_CHOICE;
    }

    isShortAnswer  () {
        return this.type == Question.SHORT_ANSWER;
    }

    isLongAnswer () {
        return this.type == Question.LONG_ANSWER;
    }

    setType (typeCode) {
        if (typeCode == 0)
            this.type = Question.SHORT_ANSWER;
        else if (typeCode == 1)
            this.type = Question.MULTI_CHOICE;
        else this.type = Question.LONG_ANSWER;
    }

    getTypeCode () {
        if (this.type == Question.SHORT_ANSWER)
            return 0;
        else if (this.type == Question.MULTI_CHOICE)
            return 1;
        else return 2;
    }


}

module.exports = q;