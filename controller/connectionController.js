const model = require('../models/connection');
const isEmpty = require('lodash');
const { v4: uuidv4 } = require('uuid');
const rsvp = require('../models/rsvp');

exports.connections = (req, res, next) => {
    model.find()
    .then(connections=>{
        let groups = consGroupByCat(connections);
        res.render('./connectionsfolder/connections', {groups});
    })
    .catch(err => next(err));
};

function consGroupByCat(connections){
    // console.log(connections);
    let cons = connections.reduce((r,c) => {
        r[c.category]=[...r[c.category] || [], c];
        return r;
    }, {});
    if(isEmpty(cons))
    return cons;
    else
        return false;
}

exports.newConnection = (req, res) => {
    res.render('./connectionsfolder/newConnection');
};

exports.create = (req, res, next) => {
    let connection = model(req.body);
    connection.host = req.session.user;
    connection.save()
    .then(connection => {
        req.flash('success', 'Connection has been created successfully');
        res.redirect('/connections');
    })
    .catch(err => {
        if(err.name === 'ValidationError'){
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};


exports.show = (req, res, next) => {
    let id = req.params.id;
    // if(!id.match(/^[0-9a-fA-F]{24}$/)){
    //     let err = new Error('Invalid Connection id');
    //     err.status = 400;
    //     next(err);
    // }
    model.findById(id).populate('host', 'firstName lastName')
    .then(connection => {
        if(connection){
            // console.log(connection);
            // connection = connectionTimeStamp(connection);
            let rsvplt = 0;
            rsvp.find({connectionid: req.params.id, status:"YES"})
            .then(rsvpcons => {
                if(rsvpcons) rsvplt = rsvpcons.length;
                    res.render('./connectionsfolder/connection', {connection, rsvplt});
            })
            .catch(err => next(err));
        } else{
            let err = new Error('Cannot find a connection with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    // if(!id.match(/^[0-9a-fA-F]{24}$/)){
    //     let err = new Error('Invalid Connection id');
    //     err.status = 400;
    //     return next(err);
    // }
    model.findById(id)
    .then(connection => {
        if(connection){
        return res.render('./connectionsfolder/edit', {connection});
        } else {
            let err = new Error('Cannot find a connection with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};


exports.update = (req, res, next) => {
    let connection = req.body;
    let id = req.params.id;
    // if(!id.match(/^[0-9a-fA-F]{24}$/)){
    //     let err = new Error('Invalid Connection id');
    //     err.status = 400;
    //     return next(err);
    // }
    model.findByIdAndUpdate(id, connection, {useFindAndModify: false, runValidators: true})
    .then(connection => {
        if(connection){
            req.flash('success', 'Connection has been updated successfully');
            res.redirect('/connections/'+id);
        } else{
            let err = new Error('Cannot find a connection with id ', +id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        if(err.name === 'ValidationError')
        req.flash('error', err.message);
        return res.redirect('back');
    });
};


exports.delete = (req, res, next) => {
    let id = req.params.id;
    // if(!id.match(/^[0-9a-fA-F]{24}$/)){
    //     let err = new Error('Invalid Connection id');
    //     err.status = 400;
    //     return next(err);
    // }
    model.findByIdAndDelete(id, {useFindAndModify: false})
    .then(connection => {
        if(connection){
            rsvp.deleteMany({connectionid: req.params.id})
            .then(conInfo => {
                req.flash('success', 'Connection has been deleted successfully');
                res.redirect('/connections');
            })
            .catch(err => next(err));
        } else {
            let err = new Error('Cannot find a connection with id ', +id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=> next(err));
};

exports.createRsvp = (req, res, next) => {
    let status = req.body.status.toUpperCase();
    rsvp.find({connectionid: req.params.id, userid: req.session.user})
    .then(rsvpInf => {
        if(rsvpInf.length == 1){
            rsvpInf[0].status = status;
            rsvp.findByIdAndUpdate(rsvpInf[0]._id, rsvpInf[0], 
                {useFindAndModify: false, runValidators: true})
            .then(rsvpObject => {
                if(rsvpObject){
                    req.flash('success', 'RSVP updated successfully');
                    res.redirect('/users/profile');
                }
                else{
                    let err = new Error('Cannot update RSVP for this connection');
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err=>next(err));
        }
        else{
            let rsvpObject = new rsvp();
            rsvpObject.status = status;
            rsvpObject.userid = req.session.user;
            rsvpObject.connectionid = req.params.id;
            rsvpObject.save()
            .then(rsvpInf=>{
                req.flash('success', 'Successfully created RSVP for this connection');
                res.redirect('/users/profile');
            })
            .catch(err=>next(err));
        }
    })
    .catch(err=>next(err));
};

exports.deleteRSVP = (req, res, next) => {
    rsvp.deleteOne({connectionid: req.params.id, userid: req.session.user})
    .then(rsvpInf=>{
        if(rsvpInf){
            req.flash('success', 'Successfully deleted RSVP');
            res.redirect('/users/profile');
        }
    })
    .catch(err=>next(err));
};