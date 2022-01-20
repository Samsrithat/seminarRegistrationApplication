const model = require('../models/connection');
const {body} = require('express-validator');
const { DateTime } = require("luxon");
const {validationResult} = require('express-validator');
var curdate =  new Date().toJSON().slice(0, 10);

exports.validateId = (req, res, next) => {
    let id = req.params.id;
    if(id.match(/^[0-9a-fA-F]{24}$/)){
        return next();
    } else{
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    }
};

exports.validateSignUp = [body('firstName', 'FirstName cannot be empty').notEmpty().trim().escape(),
body('lastName', 'Lastname cannot be empty').notEmpty().trim().escape(),
body('email', 'Email must be valid').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be between 8 to 64 characters').isLength({min: 8, max: 64})
];

exports.validateSignIn = [body('email', 'Email must be valid').isEmail().trim().escape().normalizeEmail(),
body('password', 'Password must be between 8 to 64 characters').isLength({min: 8, max: 64})
];

exports.validateConnection = [body('category', 'Category must be 3 or more characters').isLength({min: 3}).trim().escape(),
body('title', 'Title must be 3 or more characters').isLength({min: 3}).trim().escape(),
body('venue', 'Venue cannot be empty').notEmpty().trim().escape(),
body('description', 'Description must be more than 10 characters').isLength({min: 10}).trim().escape(),
body('img', 'image url cannot be empty').notEmpty().trim().escape(),
body('date', 'Date cannot be empty and should be valid').notEmpty().trim().escape(),
body('date', 'Date should be after today').trim().escape().isAfter(curdate),
body('starttime', 'Start time cannot be empty').notEmpty().trim().escape(),
body('endtime', 'End time cannot be empty').notEmpty().trim().escape().custom((value, {req})=>{
    if(value<req.body.starttime){
        throw new Error('Ending time should be after starting time')
    } 
    else return true;
}),
];

exports.validateResult = (req, res, next)=>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error=>{
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } 
    else{
        return next();
    }
};

exports.isValidRsvp = (req, res, next) => {
    if(req.body.rsvp) {
        req.body.status = req.body.rsvp;
    }
    let status = req.body.status;
    if(status == null){
        req.flash('error', 'RSVP cannot be empty');
        res.redirect('/');
    }
    else{
        status = req.body.status.toUpperCase();
        if(status == 'YES' || status == 'NO' || status == 'MAYBE'){
            next();
        } else{
            req.flash('error', 'RSVP can either be YES, NO, or MAYBE');
            res.redirect('/');
        }
    }
};

exports.isuserConnection = (req, res, next) => {
    model.findById(req.params.id)
    .then(result=>{
        if(result.host._id == req.session.user){
            req.flash('error', 'Cannot RSVP to self created connection');
            res.redirect('/');
        } 
        else{
            next();
        }
    })
    .catch(err=>next(err));
};
