/**
 * Created by david on 8/30/2016.
 */

// don't change these without checking question.ejs which uses them in a form
const MULTI_CHOICE = 'multiChoice';
const SHORT_ANSWER = 'shortAnswer';
const LONG_ANSWER = 'longAnswer';
const NO_CORRECT_ANSWER = 'noneCorrect';
const NO_TIME_LIMIT = 'unlimited';

// A constructor for a question object that takes the app's request req and pulls out the various peices from it.
// var Question = function (req) {
//
//     this.descr= req.body.descr;
//     this.id= req.body.id;
//     this.name =  req.body.name;
//     this.warnTime =  req.body.warnTime;
//     this.type= req.body.type;
//     if (this.type == MULTI_CHOICE) {
//         this.aAns = req.body.aAns ? req.body.aAns.trim() : undefined;
//         this.bAns = req.body.bAns ? req.body.bAns.trim() : undefined;
//         this.cAns = req.body.cAns ? req.body.cAns.trim() : undefined;
//         this.dAns = req.body.dAns ? req.body.dAns.trim() : undefined;
//         this.eAns = req.body.eAns ? req.body.eAns.trim() : undefined;
//         this.answer = req.body.multiChoiceCorrectAnswer;
//         // form will send multiChoiceCorrectAnswer=noneCorrect if that radio button is selected.
//         // Set the answer field to undef so that null goes into db for the answer.
//         if (this.answer == NO_CORRECT_ANSWER)
//             this.answer = undefined;
//     }
//     else {
//         this.answer = req.body.answer ? req.body.answer.trim() : undefined;
//     }
// }

// a do-nothing constructor with two methods below that can init it correctly 
var Question = function () {}

// initialize properties based on a request object
// id is optional.  Not included when the question is newly created.
Question.prototype.initFromRequest = function (req, id) {
    this.descr= req.body.descr;
    this.id=  id;
    this.name =  req.body.name;
    this.warnTime =  req.body.warnTime;
    if (this.warnTime == NO_TIME_LIMIT)
        this.warnTime = undefined;
    if (req.files.image)
        this.image = req.files.image ; // this is the image file that gets put in a folder by multer
    this.type= req.body.type;  // one of shortAnswer, multiChoice, longAnswer
    if (this.isMultiChoice()) {
        this.aAns = req.body.aAns ? req.body.aAns.trim() : undefined;
        this.bAns = req.body.bAns ? req.body.bAns.trim() : undefined;
        this.cAns = req.body.cAns ? req.body.cAns.trim() : undefined;
        this.dAns = req.body.dAns ? req.body.dAns.trim() : undefined;
        this.eAns = req.body.eAns ? req.body.eAns.trim() : undefined;
        this.answer = req.body.multiChoiceCorrectAnswer;
        // form will send multiChoiceCorrectAnswer=noneCorrect if that radio button is selected.
        // Set the answer field to undef so that null goes into db for the answer.
        if (this.answer == NO_CORRECT_ANSWER)
            this.answer = undefined;
    }
    else {
        this.answer = req.body.answer ? req.body.answer.trim() : undefined;
    }    
} 

// initialize properties based on a row from the question table in the db
Question.prototype.initFromRow = function (row) {
    this.id = row.id;
    this.name = row.name;
    this.descr = row.description;
    this.answer = row.answer;
    this.warnTime = row.waitTimeSecs;
    if (!this.warnTime)
        this.warnTime = NO_TIME_LIMIT;
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
}



Question.prototype.isMultiChoice = function () {
    return this.type == MULTI_CHOICE;
}

Question.prototype.isShortAnswer = function () {
    return this.type == SHORT_ANSWER;
}

Question.prototype.isLongAnswer = function () {
    return this.type == LONG_ANSWER;
}

Question.prototype.setType = function (typeCode) {
    if (typeCode == 0)
        this.type = SHORT_ANSWER;
    else if (typeCode == 1)
        this.type = MULTI_CHOICE;
    else this.type = LONG_ANSWER;
}

Question.prototype.getTypeCode = function() {
    if (this.type == SHORT_ANSWER)
        return 0;
    else if (this.type == MULTI_CHOICE)
        return 1;
    else return 2;
}

module.exports = Question;

